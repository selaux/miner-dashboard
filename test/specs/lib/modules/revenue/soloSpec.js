'use strict';

var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Solo = require('../../../../../lib/modules/revenue/solo');

describe('modules/revenue/solo', function () {
    var config = {
            id: 123,
            miners: [
                {
                    miner: 'miner1',
                    market: 'market1',
                    technical: 'technical1'
                }
            ]
        },
        app;

    beforeEach(function () {
        app = new EventEmitter();
        app.logger = {
            warn: sinon.stub()
        };
        app.modules = [
            { id: 'miner1', title: 'Miner 1' }
        ];
    });

    it('should show a warning if the old config format is used', function () {
        var solo = new Solo(app, {
            id: 123,
            miner: 'miner1',
            market: 'market1',
            technical: 'technical1'
        });

        expect(app.logger.warn).to.have.been.calledOnce;
        expect(app.logger.warn).to.have.been.calledWith('%s - The configuration format you are using for solo revenue is deprecated and will be removed soon. Please take a look at the documentation for the new format.', 123);
        expect(solo.config).to.deep.equal({
            chartTimespan: 14 * 24 * 60 * 60 * 1000,
            chartPrecision: 60 * 60 * 1000,
            miners: [
                {
                    miner: 'miner1',
                    market: 'market1',
                    technical: 'technical1'
                }
            ]
        });
    });

    it('should show a warning if the old config format is used with an array', function () {
        var solo = new Solo(app, {
            id: 123,
            miner: ['miner1', 'miner2'],
            market: 'market1',
            technical: 'technical1'
        });

        expect(app.logger.warn).to.have.been.calledOnce;
        expect(app.logger.warn).to.have.been.calledWith('%s - The configuration format you are using for solo revenue is deprecated and will be removed soon. Please take a look at the documentation for the new format.', 123);
        expect(solo.config).to.deep.equal({
            chartTimespan: 14 * 24 * 60 * 60 * 1000,
            chartPrecision: 60 * 60 * 1000,
            miners: [
                {
                    miner: 'miner1',
                    market: 'market1',
                    technical: 'technical1'
                },
                {
                    miner: 'miner2',
                    market: 'market1',
                    technical: 'technical1'
                }
            ]
        });
    });

    it('should calculate revenue when any miner hashrate is updated', function (done) {
        var solo = new Solo(app, config);

        solo.minerData = {
            miner1: { price: 100, currency: 'NMC', blockReward: 10, probability: 0.0001 }
        };

        solo.on('change', function () {
            expect(_.omit(solo.toJSON(), 'historicalData')).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day',
                minerTitles: {
                    miner1: 'Miner 1'
                },
                'revenue.miner1': 8640
            });
            done();
        });

        app.emit('update:data:miner1', { averageHashrate: 1e-6, coin: 'BTC' });
    });

    it('should calculate revenue when miner is not connected', function (done) {
        var solo = new Solo(app, config);

        solo.minerData = {
            miner1: { averageHashrate: 1e-6, coin: 'BTC', price: 100, currency: 'NMC', blockReward: 10, probability: 0.0001 }
        };

        solo.on('change', function () {
            expect(_.omit(solo.toJSON(), 'historicalData')).to.deep.equal({
                value: 0,
                currency: 'NMC',
                interval: 'Day',
                minerTitles: {
                    miner1: 'Miner 1'
                },
                'revenue.miner1': 0
            });
            done();
        });

        app.emit('update:data:miner1', { connected: false });
    });

    it('should calculate revenue when market prices are updated', function (done) {
        var solo = new Solo(app, config);

        solo.minerData = {
            miner1: { averageHashrate: 1e-6, coin: 'BTC', blockReward: 10, probability: 0.0001 }
        };

        solo.on('change', function () {
            expect(_.omit(solo.toJSON(), 'historicalData')).to.deep.equal({
                value: 8640,
                currency: 'NMC',
                interval: 'Day',
                minerTitles: {
                    miner1: 'Miner 1'
                },
                'revenue.miner1': 8640
            });
            done();
        });

        app.emit('update:data:market1', { close: 100, currency: 'NMC' });
    });

    it('should calculate revenue when no market is specified', function (done) {
        var solo = new Solo(app, {
            miners: [
                {
                    miner: 'miner1',
                    technical: 'technical1'
                }
            ]
        });

        solo.minerData = {
            miner1: { averageHashrate: 1e-6, coin: 'BTC', blockReward: 10, probability: 0.0001 }
        };

        solo.on('change', function () {
            expect(_.omit(solo.toJSON(), 'historicalData')).to.deep.equal({
                value: 86.4,
                currency: 'BTC',
                interval: 'Day',
                minerTitles: {
                    miner1: 'Miner 1'
                },
                'revenue.miner1': 86.4
            });
            done();
        });

        app.emit('update:data:miner1', { averageHashrate: 1e-6 });
    });

    it('should calculate revenue when technical info is updated', function (done) {
        var solo = new Solo(app, config);

        solo.minerData = {
            miner1: { averageHashrate: 1e-6, coin: 'BTC', blockReward: 10, probability: 0.0001, price: 100, currency: 'NMC' }
        };

        solo.on('change', function () {
            expect(_.omit(solo.toJSON(), 'historicalData')).to.deep.equal({
                value: 17280,
                currency: 'NMC',
                interval: 'Day',
                minerTitles: {
                    miner1: 'Miner 1'
                },
                'revenue.miner1': 17280
            });
            done();
        });

        app.emit('update:data:technical1', { coin: 'BTC', blockReward: 20, probability: 0.0001 });
    });

    it('should calculate revenue for multiple miners', function (done) {
        var solo = new Solo(app, {
            miners: [
                {
                    miner: 'miner1',
                    market: 'market1',
                    technical: 'technical1'
                },
                {
                    miner: 'miner2',
                    market: 'market2',
                    technical: 'technical2'
                }
            ]
        });

        solo.minerData = {
            miner1: { averageHashrate: 1e-6, coin: 'BTC', blockReward: 10, probability: 0.0001, price: 100, currency: 'NMC' },
            miner2: { averageHashrate: 1e-6, coin: 'BTC', blockReward: 10, probability: 0.0001, price: 100, currency: 'PPC' }
        };

        solo.on('change', function () {
            expect(_.omit(solo.toJSON(), 'historicalData')).to.deep.equal({
                value: 25920,
                currency: 'NMC',
                interval: 'Day',
                minerTitles: {
                    miner1: 'Miner 1',
                    miner2: 'miner2'
                },
                'revenue.miner1': 8640,
                'revenue.miner2': 17280
            });
            done();
        });

        app.emit('update:data:miner2', { averageHashrate: 2e-6 });
    });

    it('should set the title to "Revenue" when no title is set in config', function () {
        var solo = new Solo(this.app, {});
        expect(solo.title).to.equal('Revenue');
    });

    it('should set the title to config.title when it is set', function () {
        var solo = new Solo(this.app, {
                title: 'Some Title'
            });
        expect(solo.title).to.equal('Some Title');
    });

    it('should add the values to historicalData', function () {
        var solo = new Solo(app, {
                miners: [
                    {
                        miner: 'miner1',
                        market: 'market1',
                        technical: 'technical1'
                    },
                    {
                        miner: 'miner2',
                        market: 'market2',
                        technical: 'technical2'
                    }
                ]
            }),
            now = new Date().getTime();

        solo.set({
            value: 25920,
            currency: 'NMC',
            interval: 'Day',
            minerTitles: {
                miner1: 'Miner 1',
                miner2: 'miner2'
            },
            'revenue.miner1': 8640,
            'revenue.miner2': 17280
        });
        expect(solo.get('historicalData')).to.have.length(1);
        expect(solo.get('historicalData')[0]['revenue.miner1']).to.equal(8640);
        expect(solo.get('historicalData')[0]['revenue.miner2']).to.equal(17280);
        expect(solo.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
    });

});