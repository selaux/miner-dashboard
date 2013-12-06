'use strict';

var _ = require('lodash'),
    timespan = require('timespan');

module.exports = function (timespanInSeconds) {
    var ts,
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

    ts = timespan.fromSeconds(timespanInSeconds);
    [
        'days',
        'hours',
        'minutes',
        'seconds'
    ].forEach(function (unit) {
        var times = ts[unit];

        if (tsString !== '' || times !== 0) {
            tsString += times + unit.charAt(0).toLowerCase();
        }
    });

    return tsString;
};