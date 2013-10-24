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

    it('should set the title correctly', function () {
        var app = {},
            config = {
                symbol: 'wantedSymbol'
            },
            bitcoincharts = new Bitcoincharts(app, config);

        expect(bitcoincharts.title).to.equal('wantedSymbol Market @ Bitcoin Charts');
    });

});