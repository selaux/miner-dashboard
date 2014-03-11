'use strict';

var moment = require('moment');

module.exports = function (time) {
    if (typeof time === 'string') {
        return time;
    }
    if (typeof time !== 'number') {
        return '';
    }

    return moment(time).format('YYYY-MM-DD, HH:mm:ss');
};