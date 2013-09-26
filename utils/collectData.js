'use strict';

var _ = require('lodash');

module.exports = function (app) {
    return {
        connected: true,
        config: _.omit(_.clone(app.get('config')), 'miners'),
        miners: app.get('adapters').map(function (adapter) {
            return _.extend({}, adapter.data, { config: adapter.config });
        })
    };
};