'use strict';

var _ = require('lodash'),
    winston = require('winston');

module.exports = function (options) {
    var defaults = {
        level: 'info'
    };

    options = _.defaults(options || {}, defaults);
    if (!options.transports) {
        options.transports = [ new (winston.transports.Console)({ level: options.level, timestamp: true }) ];
    }

    return new (winston.Logger)(options);
};