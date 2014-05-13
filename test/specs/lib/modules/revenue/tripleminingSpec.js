'use strict';

var EventEmitter = require('events').EventEmitter,

    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),
    Bluebird = require('bluebird'),
    _ = require('lodash'),

    technicalData = {
        probability: 1
    },
    marketData = {
        bid: 2,
        currency: 'NMC'
    },
    poolResponse = {
        hashrate: 3
    },
    userResponse = {
        'estimated_payout': 4.0000
    };

chai.use(sinonChai);

describe('modules/revenue/triplemining', function () {
    var Triplemining,
        requestStub,
        app,
        config = {
        apiKey: 'someApiKey',
        worker: 'testWorker',
        market: 'marketId',
        technical: 'technicalId'
    };

    beforeEach(function () {
        requestStub = sinon.stub();
        requestStub.withArgs('https://api.triplemining.com/json/stats').returns(Bluebird.resolve(poolResponse));
        requestStub.withArgs('https://api.triplemining.com/json/someApiKey').returns(Bluebird.resolve(userResponse));
        Triplemining = SandboxedModule.require('../../../../../lib/modules/revenue/triplemining', {
            requires: {
                '../../utils/request': requestStub
            }
        });
        app = new EventEmitter();
        app.logger = { debug: sinon.stub(), info: sinon.stub() };
    });

    it('should update after getting data from triplemining', function (done) {
        var triplemining = new Triplemining(app, config);

        triplemining.technicalData = technicalData;
        triplemining.marketData = marketData;

        triplemining.on('change', function () {
            setImmediate(function () {
                expect(_.omit(triplemining.toJSON(), 'historicalData')).to.deep.equal({
                    value: 2073600000 * 1e6,
                    currency: 'NMC',
                    interval: 'Day'
                });
                expect(app.logger.debug).to.have.been.calledOnce;
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched revenue estimate from triplemining',
                    triplemining.id,
                    JSON.stringify([ poolResponse, userResponse ])
                );
                done();
            });
        });
    });

    it('should update data after an update of the technical module', function (done) {
        var triplemining = new Triplemining(app, config);

        triplemining.marketData = marketData;

        setTimeout(function () {
            triplemining.on('change', function () {
                expect(_.omit(triplemining.toJSON(), 'historicalData')).to.deep.equal({
                    value: 2073600000 * 1e6,
                    currency: 'NMC',
                    interval: 'Day'
                });
                done();
            });
            app.emit('update:data:technicalId', technicalData);
        }, 60);

    });

    it('should update data after an update of the market module', function (done) {
        var triplemining = new Triplemining(app, config);

        triplemining.technicalData = technicalData;

        setTimeout(function () {
            triplemining.on('change', function () {
                expect(_.omit(triplemining.toJSON(), 'historicalData')).to.deep.equal({
                    value: 2073600000 * 1e6,
                    currency: 'NMC',
                    interval: 'Day'
                });
                done();
            });
            app.emit('update:data:marketId', marketData);
        }, 60);
    });

    it('should return revenue in btc if no market module is specified', function (done) {
        var triplemining = new Triplemining(app, _.omit(config, 'market'));

        triplemining.technicalData = technicalData;

        triplemining.on('change', function () {
            expect(_.omit(triplemining.toJSON(), 'historicalData')).to.deep.equal({
                value: 1036800000 * 1e6,
                currency: 'BTC',
                interval: 'Day'
            });
            done();
        });
    });

    [
        'https://api.triplemining.com/json/stats',
        'https://api.triplemining.com/json/someApiKey'
    ].forEach(function (url) {
        it('should not throw an error if the request to ' + url + 'fails with an error', function (done) {
            var error = new Error('Test Error'),
                triplemining;

            requestStub.withArgs(url).returns(Bluebird.reject(error));

            triplemining = new Triplemining(app, { apiKey: 'someApiKey' });
            triplemining.technicalData = technicalData;
            triplemining.marketData = marketData;

            setTimeout(function () {
                expect(triplemining.toJSON()).to.be.empty;
                expect(app.logger.info).to.have.been.calledOnce;
                expect(app.logger.info).to.have.been.calledWith('%s - error fetching revenue estimate from triplemining', triplemining.id, error.toString());
                done();
            }, 10);
        });
    });

    it('should have the title set to Earnings if no title is specified in config', function () {
        var triplemining = new Triplemining(app);

        expect(triplemining.title).to.equal('Revenue');
    });

    it('should have the title set to config.title if it is set', function () {
        var triplemining = new Triplemining(app, { title: 'Some Title' });

        expect(triplemining.title).to.equal('Some Title');
    });

    it('should add the values to historicalData', function () {
        var triplemining = new Triplemining(app),
            now = new Date().getTime();

        triplemining.set({ currency: 'BTC', value: 123, interval: 'Day' });
        expect(triplemining.get('historicalData')).to.have.length(1);
        expect(triplemining.get('historicalData')[0].value).to.equal(123);
        expect(triplemining.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
    });

});