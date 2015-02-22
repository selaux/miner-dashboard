'use strict';

var _ = require('lodash'),
    SandboxedModule = require('sandboxed-module'),
    Bluebird = require('bluebird'),

    cryptocoinchartsAnswer = {
        'id': 'btc/eur',
        'price': '484.64000000',
        'price_before_24h': '485.82000000',
        'volume_first': '1096.24353432283',
        'volume_second': '522494.62242794',
        'volume_btc': '1096.24',
        'best_market': 'hitbtc',
        'latest_trade': '2014-06-09 15:49:12'
    };

describe('modules/market/cryptocoinchartsInfo', function () {
    var app,
        Cryptocoincharts,
        requestStub;

    beforeEach(function () {
        requestStub = sinon.stub();
        requestStub.withArgs('http://api.cryptocoincharts.info/tradingPair/btc_usd').returns(Bluebird.resolve(cryptocoinchartsAnswer));
        Cryptocoincharts = SandboxedModule.require('../../../../../lib/modules/markets/cryptocoinchartsInfo', {
            requires: {
                '../../utils/request': requestStub
            }
        });
        app = { logger: { debug: sinon.stub(), info: sinon.stub() } };
    });

    it('should get data from cryptocoincharts correctly', function (done) {
        var config = {
                tradingPair: 'btc_eur'
            },
            cryptocoincharts;

        requestStub.withArgs('http://api.cryptocoincharts.info/tradingPair/btc_eur').returns(Bluebird.resolve(cryptocoinchartsAnswer));

        cryptocoincharts = new Cryptocoincharts(app, config);
        cryptocoincharts.on('change', function () {
            setImmediate(function () {
                expect(app.logger.debug).to.have.been.calledOnce;
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched markets from cryptocoincharts.info',
                    cryptocoincharts.id,
                    JSON.stringify(cryptocoinchartsAnswer)
                );

                expect(_.omit(cryptocoincharts.toJSON(), 'historicalData')).to.deep.equal({
                    currency: 'EUR',
                    close: 484.64,
                    bestMarket: 'hitbtc'
                });
                done();
            });
        });
    });

    it('it should handle errors that occur during the request', function (done) {
        var err = new Error('Test Error'),
            cryptocoincharts;

        requestStub.withArgs('http://api.cryptocoincharts.info/tradingPair/btc_usd').returns(Bluebird.reject(err));

        cryptocoincharts = new Cryptocoincharts(app, {});
        setTimeout(function () {
            expect(app.logger.info).to.have.been.calledOnce;
            expect(app.logger.info).to.have.been.calledWith(
                '%s - error fetching markets from cryptocoincharts.info',
                cryptocoincharts.id,
                err.toString()
            );

            expect(cryptocoincharts.toJSON()).to.be.empty;
            done();
        }, 10);
    });

    it('should set the title correctly', function () {
        var config = {
                tradingPair: 'ltc_btc'
            },
            cryptocoincharts;

        requestStub.withArgs('http://api.cryptocoincharts.info/tradingPair/ltc_btc').returns(Bluebird.resolve(cryptocoinchartsAnswer));

        cryptocoincharts = new Cryptocoincharts(app, config);
        expect(cryptocoincharts.title).to.equal('ltc_btc Market @ Cryptocoincharts.info');
    });

    describe('set', function () {
        it('should add the bid, ask and close values to historicalData', function () {
            var cryptocoincharts = new Cryptocoincharts(app, {}),
                now = new Date().getTime();

            cryptocoincharts.set({ close: 3 });
            expect(cryptocoincharts.get('historicalData')).to.have.length(1);
            expect(cryptocoincharts.get('historicalData')[0].close).to.equal(3);
            expect(cryptocoincharts.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
        });
    });

});
