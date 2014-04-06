'use strict';

var _ = require('lodash');

function buildMeanValue(historicalData, config) {
    var sum = function (sum, value) { return sum + value; },
        lastDataElement = _.last(historicalData);

    _.keys(lastDataElement.source[0]).forEach(function (key) {
        lastDataElement[key] = _(lastDataElement.source).pluck(key).reduce(sum) / lastDataElement.source.length;
    });

    if (historicalData.length === 1) {
        if (_.last(lastDataElement.source).timestamp - lastDataElement.source[0].timestamp > config.chartPrecision) {
            delete lastDataElement.source;
        }
    } else {
        if (lastDataElement.timestamp - historicalData[historicalData.length-2].timestamp > config.chartPrecision) {
            delete lastDataElement.source;
        }
    }

    return historicalData;
}

module.exports = function (attributesToSave, originalSetMethod) {
    return function () {
        var self = this,
            attributes = arguments[0],
            historicalData = this.get('historicalData') || [],
            now = new Date().getTime(),
            lastUnfilledDataElement = _.findLast(historicalData, function (el) { return el.source !== undefined;  }),
            sourceElement = _.extend({ timestamp: now }, _.pick(attributes, attributesToSave)),
            fullElement = { source: [ sourceElement ] };

        historicalData = historicalData.filter(function (observation) {
            return observation.timestamp > (now - self.config.chartTimespan);
        });
        if (lastUnfilledDataElement) {
            lastUnfilledDataElement.source.push(sourceElement);
        } else {
            if (historicalData.length > 1) {
                fullElement.source.push(_.extend({ timestamp: now }, _.pick(attributes, attributesToSave)));
            }
            historicalData.push(fullElement);
        }
        historicalData = buildMeanValue(historicalData, self.config);

        attributes.historicalData = historicalData;
        arguments[0] = attributes;

        originalSetMethod.apply(this, arguments);
    };
};