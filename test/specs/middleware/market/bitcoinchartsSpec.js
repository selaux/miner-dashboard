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
    bitcoincharts = SandboxedModule.require('../../../../middleware/market/bitcoincharts', {
        requires: {
            '../../config/config.json': {
                bitcoincharts: {
                    symbol: 'wantedSymbol'
                }
            },
            'request': function (options, callback) {
                expect(options).to.deep.equal({
                    uri: 'http://api.bitcoincharts.com/v1/markets.json',
                    json: true
                });
                callback(null, {
                    body: bitcoinChartsAnswer
                });
            }
        }
    });

describe('middleware/market/bitcoincharts', function () {

    it('should get data from bitcoincharts correctly', function () {
        var data = {};
        bitcoincharts(data, function (err) {
            expect(err).not.to.be.ok;
            expect(data.market).to.equal(bitcoinChartsAnswer[1]);
        });
    });

});