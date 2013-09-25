'use strict';

var chai = require('chai'),
    expect = chai.expect,

    lone = require('../../../../middleware/earnings/solo');

describe('middleware/earnings/solo', function () {

    it('should calculate earnings correctly', function () {
        var data = {
                miner: {
                    avgHashrate: 1e-6
                },
                technical: {
                    btcPerBlock: 10,
                    probability: 0.0001
                },
                market: {
                    ask: 100,
                    currency: 'NMC'
                }
            };

        lone(data, function (err) {
            expect(err).not.to.be.ok;
            expect(data.earnings).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
        });
    });

});