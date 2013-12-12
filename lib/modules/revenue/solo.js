'use strict';

var _ = require('lodash'),

    Module = require('../../ServerModule');

module.exports = Module.extend({

    template: 'revenue',

    initialize: function () {
        var self = this,
            miner = self.config.miner;

        this.title = this.config.title || 'Revenue';

        self.config.miner = _.isArray(miner) ? miner : [ miner ];
        self.minerData = {};

        self.app.on('update:data:' + self.config.technical, function (data) {
            self.technicalData = data;
            self.calculateRevenue();
        });

        if (self.config.market) {
            self.app.on('update:data:' + self.config.market, function (data) {
                self.marketData = data;
                self.calculateRevenue();
            });
        }

        self.config.miner.forEach(function (miner) {
            self.app.on('update:data:' + miner, function (data) {
                self.minerData[miner] = data;
                self.calculateRevenue();
            });
        });
    },

    calculateRevenue: function () {
        var self = this,
            currency,
            ask,
            totalHashrate;

        if (!this.technicalData) {
            return;
        }
        if (this.config.market && !this.marketData) {
            return;
        }
        if (_.any(this.config.miner, function (miner) { return !_.has(self.minerData, miner); })) {
            return;
        }

        totalHashrate = _.reduce(this.minerData, function (sum, miner) { return sum + (miner.avgHashrate || 0); }, 0);
        ask = this.config.market ? this.marketData.ask : 1;
        currency = this.config.market ? this.marketData.currency : 'BTC';

        this.updateData({
            value: this.technicalData.btcPerBlock * (24 * 60 * 60) * totalHashrate * 1e6 * this.technicalData.probability * ask,
            currency: currency,
            interval: 'Day'
        });
    }

});