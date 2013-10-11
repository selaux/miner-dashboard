'use strict';

var chai = require('chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),

    bitcoinChartsAnswer = [
        {
            symbol: 'otherSymbol'
        },
        {
            symbol: 'wantedSymbol'
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
                symbol: 'wantedSymbol'
            });
            done();
        });
    });

});