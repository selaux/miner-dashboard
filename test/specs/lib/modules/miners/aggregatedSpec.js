'use strict';

var EventEmitter = require('events').EventEmitter,

    _ = require('lodash'),

    Aggregated = require('../../../../../lib/modules/miners/aggregated');

describe('modules/miners/aggregated', function () {
    var app,
        defaultConfig = {
            miners: [ 'miner1', 'miner2' ]
        };

    beforeEach(function () {
        app = new EventEmitter();
        app.modules = [
            { get: sinon.stub().returns(123), id: 'miner1', title: 'Miner 1' },
            { get: sinon.stub().returns(456), id: 'miner2', title: 'Miner 2' },
        ];

    });

    it('should have the default title set to "Total Hashrate"', function () {
        var aggregated = new Aggregated(app, defaultConfig);
        expect(aggregated.title).to.equal('Total Hashrate');
    });

    it('should set the title to config.title if provided', function () {
        var aggregated = new Aggregated(app, _.defaults({
            title: 'Test Title'
        }, defaultConfig));
        expect(aggregated.title).to.equal('Test Title');
    });

    it('should aggregate the hashrate whenever a miner hashrate changes', function (done) {
        var aggregated = new Aggregated(app, defaultConfig);

        aggregated.on('change', function () {
            expect(aggregated.get('currentHashrate')).to.equal(579);
            expect(aggregated.get('minerTitles')).to.deep.equal({
                miner1: 'Miner 1',
                miner2: 'Miner 2'
            });
            expect(aggregated.get('currentHashrate.miner1')).to.equal(123);
            expect(aggregated.get('currentHashrate.miner2')).to.equal(456);
            done();
        });
        app.emit('update:data:miner2');
    });

    describe('aggregateHashrates', function () {
        it('should aggregate the hashrates of the provided modules', function () {
            var aggregated = new Aggregated(app, defaultConfig);

            aggregated.set = sinon.stub();
            aggregated.aggregateHashrates();

            expect(aggregated.set).to.have.been.calledOnce;
            expect(aggregated.set).to.have.been.calledWith({
                currentHashrate: 579,
                minerTitles: {
                    miner1: 'Miner 1',
                    miner2: 'Miner 2'
                },
                'currentHashrate.miner1': 123,
                'currentHashrate.miner2': 456
            });
        });
    });

    describe('set', function () {
        it('should add the values to historicalData', function () {
            var solo = new Aggregated(app, defaultConfig),
                now = new Date().getTime();

            solo.set({
                currentHashrate: 579,
                'currentHashrate.miner1': 123,
                'currentHashrate.miner2': 456,
                minerTitles: {
                    miner1: 'Miner 1',
                    miner2: 'Miner 2'
                }
            });
            console.log(solo.get('historicalData')[0].source);
            expect(solo.get('historicalData')).to.have.length(1);
            expect(solo.get('historicalData')[0]['currentHashrate.miner1']).to.equal(123);
            expect(solo.get('historicalData')[0]['currentHashrate.miner2']).to.equal(456);
            expect(solo.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
        });
    });
});