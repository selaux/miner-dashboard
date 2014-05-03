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
        var self = this;

        self.title = this.config.title || 'Total Hashrate';

        self.config.miners.forEach(function (id) {
            self.app.on('update:data:' + id, self.aggregateHashrates.bind(self));
        });
    },

    aggregateHashrates: function () {
        var self = this,
            currentHashrate = 0;

        _.each(this.app.modules, function (module) {
            if (self.config.miners.indexOf(module.id) !== -1) {
                currentHashrate += module.get('currentHashrate') || 0;
            }
        });

        self.set({
            currentHashrate: currentHashrate
        });
    },

    set: setWithHistoricalData([ 'currentHashrate' ], Module.prototype.set)
});