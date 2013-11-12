'use strict';

var _ = require('lodash');

module.exports = function (hashrate) {
    var megaHashes = { exp: 0, unit: 'M' },
        exponents = [
            { exp: 12, unit: 'E' },
            { exp: 9, unit: 'P' },
            { exp: 6, unit: 'T' },
            { exp: 3, unit: 'G' },
            megaHashes
        ],
        usedExponent;

    if (typeof hashrate === 'string') {
        return hashrate;
    }
    if (!_.isNumber(hashrate) || _.isNaN(hashrate)) {
        return '';
    }
    if (!_.isFinite(hashrate)) {
        return (hashrate > 0) ? '∞ MH/s' : '-∞ MH/s';
    }


    usedExponent = _.find(exponents, function (exponentCandidate) {
        return hashrate / Math.pow(10, exponentCandidate.exp) >= 10;
    });

    if (!usedExponent) {
        usedExponent = megaHashes;
    }

    return (hashrate / Math.pow(10, usedExponent.exp)).toFixed(2) + ' ' + usedExponent.unit + 'H/s';
};