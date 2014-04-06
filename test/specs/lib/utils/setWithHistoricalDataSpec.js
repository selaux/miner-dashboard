'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,

    setWithHistoricalData;

chai.use(sinonChai);

describe('utils/setWithHistoricalData', function () {
    var now = new Date().getTime(),
        module,
        originalSet,
        mixedInSet;

    before(function () {
        this.clock = sinon.useFakeTimers(now);
        setWithHistoricalData = require('../../../../lib/utils/setWithHistoricalData');
    });

    after(function () {
        this.clock.restore();
    });

    beforeEach(function () {
        module = {
            config: {
                chartTimespan: 24 * 60 * 60 * 1000,
                chartPrecision: 5 * 60 * 1000
            }
        };
        originalSet = sinon.spy();
        mixedInSet = setWithHistoricalData([ 'someAttr' ], originalSet);
        module.get = sinon.stub();
    });

    describe('set', function () {
        it('should add the currentHashrate value to historicalData', function () {
            mixedInSet.call(module, { someAttr: 123 });
            expect(originalSet).to.have.been.calledWith({
                someAttr: 123,
                historicalData: [
                    { someAttr: 123, timestamp: now, source: [ { someAttr: 123, timestamp: now } ] }
                ]
            });
        });

        it('should work with multiple attributes', function () {
            mixedInSet = setWithHistoricalData([ 'someAttr', 'someOtherAttr' ], originalSet);
            mixedInSet.call(module, { someAttr: 123, someOtherAttr: 456 });
            expect(originalSet).to.have.been.calledWith({
                someAttr: 123,
                someOtherAttr: 456,
                historicalData: [
                    { someAttr: 123, someOtherAttr: 456, timestamp: now, source: [ { someAttr: 123, someOtherAttr: 456, timestamp: now } ] }
                ]
            });
        });

        it('should append the currentHashrate value to existing historicalData', function () {
            module.get.withArgs('historicalData').returns([
                { timestamp: now - 5000, someAttr: 456 }
            ]);
            mixedInSet.call(module, { someAttr: 789 });

            expect(originalSet).to.have.been.calledWith({
                someAttr: 789,
                historicalData: [
                    { someAttr: 456, timestamp: now - 5000 },
                    { someAttr: 789, timestamp: now, source: [ { someAttr: 789, timestamp: now } ] }
                ]
            });
        });

        it('should remove historical data that has been logged longer than the expiration date', function () {
            module.config.chartTimespan = 5000;
            module.get.withArgs('historicalData').returns([
                { timestamp: now - 5100, someAttr: 456 },
                { timestamp: now - 2500, someAttr: 456 }
            ]);
            mixedInSet.call(module, { someAttr: 789 });

            expect(originalSet).to.have.been.calledWith({
                someAttr: 789,
                historicalData: [
                    { someAttr: 456, timestamp: now - 2500 },
                    { someAttr: 789, timestamp: now, source: [ { someAttr: 789, timestamp: now } ] }
                ]
            });
        });
    });

    describe('buildMeanValue', function () {
        it('should calculate the mean', function () {
            module.get.withArgs('historicalData').returns([
                {
                    someAttr: 2,
                    timestamp: now - 1000,
                    source: [
                        { someAttr: 2, timestamp: now - 1000 }
                    ]
                }
            ]);
            mixedInSet.call(module, { someAttr: 4 });
            expect(originalSet).to.have.been.calledWith({
                someAttr: 4,
                historicalData: [
                    {
                        someAttr: 3,
                        timestamp: now - 500,
                        source: [
                            { someAttr: 2, timestamp: now - 1000 },
                            { someAttr: 4, timestamp: now }
                        ]
                    }
                ]
            });
        });

        it('should remove the source property if historicalData has one element and the source spans chartPrecision', function () {
            module.config.chartPrecision = 400;
            module.get.withArgs('historicalData').returns([
                { someAttr: 2, timestamp: now - 1000, source: [ { someAttr: 2, timestamp: now - 1000 } ] }
            ]);
            mixedInSet.call(module, { someAttr: 4 });
            expect(originalSet).to.have.been.calledWith({
                someAttr: 4,
                historicalData: [
                    {
                        someAttr: 3,
                        timestamp: now - 500
                    }
                ]
            });
        });

        it('should remove the source property if the last value and the value before last are more than chartPrecision apart', function () {
            module.config.chartPrecision = 400;
            module.get.withArgs('historicalData').returns([
                { someAttr: 2, timestamp: now - 500 },
                {
                    someAttr: 2,
                    timestamp: now - 100,
                    source: [ { someAttr: 2, timestamp: now - 100 } ]
                }
            ]);

            mixedInSet.call(module, { someAttr: 4 });

            expect(originalSet).to.have.been.calledWith({
                someAttr: 4,
                historicalData: [
                    {   someAttr: 2, timestamp: now - 500 },
                    {   someAttr: 3, timestamp: now - 50 }
                ]
            });
        });
    });
});