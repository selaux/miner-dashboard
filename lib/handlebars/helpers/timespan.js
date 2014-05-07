'use strict';

var _ = require('lodash');

module.exports = function (timespanInSeconds) {
    var remainingSeconds,
        tsString = '';

    if (typeof timespanInSeconds === 'string') {
        return timespanInSeconds;
    }
    if (!_.isNumber(timespanInSeconds) || _.isNaN(timespanInSeconds)) {
        return '';
    }
    if (timespanInSeconds === 0) {
        return '0s';
    }

    remainingSeconds = timespanInSeconds;
    _.each({
        days: 60 * 60 * 24,
        hours: 60 * 60,
        minutes: 60,
        seconds: 1
    }, function (secondsPerUnit, unit) {
        var times = Math.floor(remainingSeconds / secondsPerUnit);
        remainingSeconds -= times * secondsPerUnit;

        if (tsString !== '' || times !== 0) {
            tsString += times + unit.charAt(0).toLowerCase();
        }
    });

    return tsString;
};