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

        app.modules = [
            { get: sinon.stub().returns(123), id: 'miner1' },
            { get: sinon.stub().returns(456), id: 'miner2' },
        ];

        aggregated.on('change', function () {
            expect(aggregated.get('currentHashrate')).to.equal(579);
            done();
        });
        app.emit('update:data:miner2');
    });

    describe('aggregateHashrates', function () {
        it('should aggregate the hashrates of the provided modules', function () {
            var aggregated = new Aggregated(app, defaultConfig);

            app.modules = [
                { get: sinon.stub().returns(123), id: 'miner1' },
                { get: sinon.stub().returns(456), id: 'miner2' },
            ];
            aggregated.set = sinon.stub();
            aggregated.aggregateHashrates();

            expect(aggregated.set).to.have.been.calledOnce;
            expect(aggregated.set).to.have.been.calledWith({
                currentHashrate: 579
            });
        });
    });

    describe('set', function () {
        it('should add the values to historicalData', function () {
            var solo = new Aggregated(this.app, {}),
                now = new Date().getTime();

            solo.set({ currentHashrate: 123 });
            expect(solo.get('historicalData')).to.have.length(1);
            expect(solo.get('historicalData')[0].currentHashrate).to.equal(123);
            expect(solo.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
        });
    });
});