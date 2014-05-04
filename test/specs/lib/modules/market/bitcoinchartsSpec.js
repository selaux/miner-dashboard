'use strict';

var chai = require('chai'),
    expect = chai.expect,
    _ = require('lodash'),
    SandboxedModule = require('sandboxed-module'),

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
    ],
    Bitcoincharts = SandboxedModule.require('../../../../../lib/modules/markets/bitcoincharts', {
        requires: {
            'request': function (options, callback) {
                expect(options).to.deep.equal({
                    uri: 'http://api.bitcoincharts.com/v1/markets.json',
                    json: true
                });
                setTimeout(function () {
                    callback(null, {
                        statusCode: 200,
                        body: bitcoinChartsAnswer
                    });
                }, 20);
            }
        }
    });

describe('modules/market/bitcoincharts', function () {

    it('should get data from bitcoincharts correctly', function (done) {
        var app = {},
            config = {
                symbol: 'wantedSymbol'
            },
            bitcoincharts = new Bitcoincharts(app, config);

        bitcoincharts.on('change', function () {
            expect(_.omit(bitcoincharts.toJSON(), 'historicalData')).to.deep.equal({
                symbol: 'wantedSymbol',
                ask: 14,
                bid: 13,
                close: 12
            });
            done();
        });
    });

    it('it should handle errors that occur during the request', function (done) {
        var Bitcoincharts = SandboxedModule.require('../../../../../lib/modules/markets/bitcoincharts', {
                requires: {
                    'request': function (options, callback) {
                        setTimeout(function () {
                            callback(new Error('Test Error'));
                        }, 20);
                    }
                }
            }),
            bitcoincharts = new Bitcoincharts({}, {});

        setTimeout(function () {
            expect(bitcoincharts.toJSON()).to.be.empty;
            done();
        }, 50);
    });

    it('it should handle non 200 status codes', function (done) {
        var Bitcoincharts = SandboxedModule.require('../../../../../lib/modules/markets/bitcoincharts', {
                requires: {
                    'request': function (options, callback) {
                        setTimeout(function () {
                            callback(null, { statusCode: 500 });
                        }, 20);
                    }
                }
            }),
            bitcoincharts = new Bitcoincharts({}, {});

        setTimeout(function () {
            expect(bitcoincharts.toJSON()).to.be.empty;
            done();
        }, 50);
    });

    it('should set the title correctly', function () {
        var app = {},
            config = {
                symbol: 'wantedSymbol'
            },
            bitcoincharts = new Bitcoincharts(app, config);

        expect(bitcoincharts.title).to.equal('wantedSymbol Market @ Bitcoin Charts');
    });

    describe('set', function () {
        it('should add the bid, ask and close values to historicalData', function () {
            var bitcoinCharts = new Bitcoincharts({}, {}),
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