'use strict';

var EventEmitter = require('events').EventEmitter,

    chai = require('chai'),
    expect = chai.expect,

    Solo = require('../../../../../lib/modules/earnings/solo');

describe('modules/earnings/solo', function () {

    function setUp () {
        var app = new EventEmitter(),
            config = {
                miner: 'minerId',
                market: 'marketId',
                technical: 'technicalId'
            },
            solo = new Solo(app, config);

        return {
            app: app,
            module: solo
        };
    }

    it('should calculate earnings when miner hashrate is updated', function (done) {
        var setup = setUp(),
            app = setup.app,
            solo = setup.module;

        solo.marketData = { ask: 100, currency: 'NMC' };
        solo.technicalData = { btcPerBlock: 10, probability: 0.0001 };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:minerId', { avgHashrate: 1e-6 });
    });

    it('should calculate earnings when market prices are updated', function (done) {
        var setup = setUp(),
            app = setup.app,
            solo = setup.module;

        solo.minerData = { avgHashrate: 1e-6 };
        solo.technicalData = { btcPerBlock: 10, probability: 0.0001 };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:marketId', { ask: 100, currency: 'NMC' });
    });

    it('should calculate earnings when technical info', function (done) {
        var setup = setUp(),
            app = setup.app,
            solo = setup.module;

        solo.minerData = { avgHashrate: 1e-6 };
        solo.marketData = { ask: 100, currency: 'NMC' };

        solo.on('update:data', function (data) {
            expect(data).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day'
            });
            done();
        });

        app.emit('update:data:technicalId', { btcPerBlock: 10, probability: 0.0001 });
    });

});