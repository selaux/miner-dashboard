'use strict';

var EventEmitter = require('events').EventEmitter,

    chai = require('chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),
    _ = require('lodash'),

    responses = {},
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
    },
    Triplemining = SandboxedModule.require('../../../../../lib/modules/revenue/triplemining', {
        requires: {
            request: require('../../../../utils/requestStub')(responses)
        }
    });

describe('modules/revenue/triplemining', function () {
    var config = {
        apiKey: 'someApiKey',
        worker: 'testWorker',
        market: 'marketId',
        technical: 'technicalId'
    };

    beforeEach(function () {
        responses['https://api.triplemining.com/json/stats'] = {
            statusCode: 200,
            body: poolResponse
        };
        responses['https://api.triplemining.com/json/someApiKey'] = {
            statusCode: 200,
            body: userResponse
        };
    });

    it('should update after getting data from triplemining', function (done) {
        var app = new EventEmitter(),
            triplemining = new Triplemining(app, config);

        triplemining.technicalData = technicalData;
        triplemining.marketData = marketData;

        triplemining.on('change', function () {
            expect(triplemining.toJSON()).to.deep.equal({
                value: 2073600000 * 1e6,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });
    });

    it('should update data after an update of the technical module', function (done) {
        var app = new EventEmitter(),
            triplemining = new Triplemining(app, config);

        triplemining.marketData = marketData;

        setTimeout(function () {
            triplemining.on('change', function () {
                expect(triplemining.toJSON()).to.deep.equal({
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
        var app = new EventEmitter(),
            triplemining = new Triplemining(app, config);

        triplemining.technicalData = technicalData;

        setTimeout(function () {
            triplemining.on('change', function () {
                expect(triplemining.toJSON()).to.deep.equal({
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
        var app = new EventEmitter(),
            triplemining = new Triplemining(app, _.omit(config, 'market'));

        triplemining.technicalData = technicalData;

        triplemining.on('change', function () {
            expect(triplemining.toJSON()).to.deep.equal({
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
            var app = new EventEmitter(),
                triplemining;

            responses[url] = null;

            triplemining = new Triplemining(app);
            triplemining.technicalData = technicalData;
            triplemining.marketData = marketData;

            setTimeout(function () {
                expect(triplemining.toJSON()).to.be.empty;
                done();
            }, 50);
        });

        it('should not throw an error if the request to ' + url + 'returns a non 200 http status code and no data', function (done) {
            var app = new EventEmitter(),
                triplemining;

            responses[url] = {
                statusCode: 500,
                body: 'Internal Server Error'
            };

            triplemining = new Triplemining(app);
            triplemining.technicalData = technicalData;
            triplemining.marketData = marketData;

            setTimeout(function () {
                expect(triplemining.toJSON()).to.be.empty;
                done();
            }, 50);
        });

    });

    it('should have the title set to Earnings if no title is specified in config', function () {
        var app = new EventEmitter(),
            triplemining = new Triplemining(app);

        expect(triplemining.title).to.equal('Revenue');
    });

    it('should have the title set to config.title if it is set', function () {
        var app = new EventEmitter(),
            triplemining = new Triplemining(app, { title: 'Some Title' });

        expect(triplemining.title).to.equal('Some Title');
    });

});