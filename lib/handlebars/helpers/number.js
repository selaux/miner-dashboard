'use strict';

var numeral = require('numeral');

function repeatString(str, times) {
    return (new Array(times + 1).join(str));
}

module.exports = function (number, options) {
    var formatString,
        precision = options && options.hash && options.hash.precision ? parseInt(options.hash.precision, 10) : 5;

    if (!number && number !== 0) {
        return '';
    }
    if (typeof number === 'string') {
        return number;
    }

    formatString = '0,0.[' + repeatString('0', precision) + ']';

    return numeral(number.toFixed(precision)).format(formatString);
};