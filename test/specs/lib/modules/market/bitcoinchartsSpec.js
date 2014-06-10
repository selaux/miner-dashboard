'use strict';

var _ = require('lodash'),
    SandboxedModule = require('sandboxed-module'),
    Bluebird = require('bluebird'),

    bitcoinChartsAnswer = [
        {
            symbol: 'otherSymbol',
            ask: 14,
            bid: 13,
            close: 12
        },
        {
            symbol: 'wantedSymbol',
            ask: 14,
            bid: 13,
            close: 12
        }
    ];

describe('modules/market/bitcoincharts', function () {
    var app,
        Bitcoincharts,
        requestStub;

    beforeEach(function () {
        requestStub = sinon.stub();
        requestStub.withArgs('http://api.bitcoincharts.com/v1/markets.json').returns(Bluebird.resolve(bitcoinChartsAnswer));
        Bitcoincharts = SandboxedModule.require('../../../../../lib/modules/markets/bitcoincharts', {
            requires: {
                '../../utils/request': requestStub
            }
        });
        app = { logger: { debug: sinon.stub(), info: sinon.stub() } };
    });

    it('should get data from bitcoincharts correctly', function (done) {
        var config = {
                symbol: 'wantedSymbol'
            },
            bitcoincharts = new Bitcoincharts(app, config);

        bitcoincharts.on('change', function () {
            setImmediate(function () {
                expect(app.logger.debug).to.have.been.calledOnce;
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched markets from bitcoincharts.com',
                    bitcoincharts.id,
                    JSON.stringify(bitcoinChartsAnswer)
                );

                expect(_.omit(bitcoincharts.toJSON(), 'historicalData')).to.deep.equal({
                    symbol: 'wantedSymbol',
                    ask: 14,
                    bid: 13,
                    close: 12
                });
                done();
            });
        });
    });

    it('it should handle errors that occur during the request', function (done) {
        var err = new Error('Test Error'),
            bitcoincharts;

        requestStub.withArgs('http://api.bitcoincharts.com/v1/markets.json').returns(Bluebird.reject(err));

        bitcoincharts = new Bitcoincharts(app, {});
        setTimeout(function () {
            expect(app.logger.info).to.have.been.calledOnce;
            expect(app.logger.info).to.have.been.calledWith(
                '%s - error fetching markets from bitcoincharts.com',
                bitcoincharts.id,
                err.toString()
            );

            expect(bitcoincharts.toJSON()).to.be.empty;
            done();
        }, 10);
    });


    it('should set the title correctly', function () {
        var config = {
                symbol: 'wantedSymbol'
            },
            bitcoincharts = new Bitcoincharts(app, config);

        expect(bitcoincharts.title).to.equal('wantedSymbol Market @ Bitcoin Charts');
    });

    describe('set', function () {
        it('should add the bid, ask and close values to historicalData', function () {
            var bitcoinCharts = new Bitcoincharts(app, {}),
                now = new Date().getTime();

            bitcoinCharts.set({ ask: 1, bid: 2, close: 3 });
            expect(bitcoinCharts.get('historicalData')).to.have.length(1);
            expect(bitcoinCharts.get('historicalData')[0].ask).to.equal(1);
            expect(bitcoinCharts.get('historicalData')[0].bid).to.equal(2);
            expect(bitcoinCharts.get('historicalData')[0].close).to.equal(3);
            expect(bitcoinCharts.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
        });
    });

});