'use strict';

var _ = require('lodash'),

    setWithHistoricalData = require('../../utils/setWithHistoricalData'),
    Module = require('../../Module');

module.exports = Module.extend({

    viewId: 'aggregatedMiners',

    defaults: {
        chartTimespan: 24 * 60 * 60 * 1000,
        chartPrecision: 5 * 60 * 1000,
        miners: []
    },

    initialize: function () {
        var self = this,
            attributesToSave = _.map(self.config.miners, function (minerId) {
                return 'currentHashrate.' + minerId;
            });

        self.set = setWithHistoricalData(attributesToSave, Module.prototype.set);

        self.title = this.config.title || 'Total Hashrate';

        self.config.miners.forEach(function (id) {
            self.app.on('update:data:' + id, self.aggregateHashrates.bind(self));
        });
    },

    aggregateHashrates: function () {
        var self = this,
            currentHashrate = 0,
            individualHashrates = {},
            minerTitles = {};

        self.config.miners.forEach(function (id) {
            var module = _.find(self.app.modules, function (module) {
                return module.id === id;
            });
            minerTitles[id] = module ? module.title : id;
            individualHashrates['currentHashrate.' + module.id] = module && module.get('currentHashrate') ? module.get('currentHashrate') : 0;
            currentHashrate += module.get('currentHashrate') || 0;
        });

        self.set(_.extend({
            currentHashrate: currentHashrate,
            minerTitles: minerTitles
        }, individualHashrates));
    }
});