'use strict';

var chai = require('chai'),
    expect = chai.expect,
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

        bitcoincharts.on('update:data', function (data) {
            expect(data).to.deep.equal({
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
            expect(bitcoincharts.data).not.to.be.ok;
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
            expect(bitcoincharts.data).not.to.be.ok;
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

});