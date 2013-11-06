'use strict';

var moment = require('moment');

module.exports = function (time) {
    if (!time) {
        return '';
    }
    if (typeof time === 'string') {
        return time;
    }

    return moment(time).format('YYYY-MM-DD, HH:mm:ss');
};