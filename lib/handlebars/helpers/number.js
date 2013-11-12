'use strict';

var numeral = require('numeral'),
    _ = require('lodash');

function repeatString(str, times) {
    return (new Array(times + 1).join(str));
}

module.exports = function (number, options) {
    var formatString,
        precision = options && options.hash && options.hash.precision ? parseInt(options.hash.precision, 10) : 5;

    if (typeof number === 'string') {
        return number;
    }
    if (!_.isNumber(number) || _.isNaN(number)) {
        return '';
    }
    if (!_.isFinite(number)) {
        return (number > 0) ? '∞' : '-∞';
    }

    formatString = '0,0.[' + repeatString('0', precision) + ']';

    return numeral(number).format(formatString);
};