'use strict';

var _ = require('lodash'),

    Module = require('../../Module');

module.exports = Module.extend({

    template: 'earnings',

    initialize: function () {
        var self = this,
            miner = self.config.miner;

        this.title = this.config.title || 'Earnings';

        self.config.miner = _.isArray(miner) ? miner : [ miner ];
        self.minerData = {};

        [ 'market', 'technical' ].forEach(function (prop) {
            self.app.on('update:data:' + self.config[prop], function (data) {
                self[prop + 'Data'] = data;
                self.calculateEarnings();
            });
        });

        self.config.miner.forEach(function (miner) {
            self.app.on('update:data:' + miner, function (data) {
                self.minerData[miner] = data;
                self.calculateEarnings();
            });
        });
    },

    calculateEarnings: function () {
        var self = this,
            totalHashrate;

        if (!this.technicalData || !this.marketData) {
            return;
        }
        if (_.any(this.config.miner, function (miner) { return !_.has(self.minerData, miner); })) {
            return;
        }

        totalHashrate = _.reduce(this.minerData, function (sum, miner) { return sum + (miner.avgHashrate || 0); }, 0);

        this.updateData({
            value: this.technicalData.btcPerBlock * (24 * 60 * 60) * totalHashrate * 1e6 * this.technicalData.probability * this.marketData.ask,
            currency: this.marketData.currency,
            interval: 'Day'
        });
    },

    getViewData: function () {
        return {
            value: this.data.value.toFixed(6)
        };
    }
    
});