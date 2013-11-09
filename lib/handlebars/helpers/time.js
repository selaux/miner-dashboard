'use strict';

var moment = require('moment'),
    _ = require('lodash');

module.exports = function (time) {
    if (typeof time === 'string') {
        return time;
    }
    if (!_.isDate(time)) {
        return '';
    }

    return moment(time).format('YYYY-MM-DD, HH:mm:ss');
};