'use strict';

var _ = require('lodash'),

    setWithHistoricalData = require('../../utils/setWithHistoricalData'),
    Module = require('../../Module');

module.exports = Module.extend({

    viewId: 'revenue',

    defaults: {
        miners: [],
        chartTimespan: 14 * 24 * 60 * 60 * 1000,
        chartPrecision: 60 * 60 * 1000
    },

    initialize: function () {
        var self = this,
            attributesToSave = _.pluck(self.config.miners, function (revConfig) {
                return 'revenue.' + revConfig.miner;
            });

        self.set = setWithHistoricalData(attributesToSave, Module.prototype.set);

        self.title = self.config.title || 'Revenue';
        self.minerData = {};

        if (self.config.miner) {
            self.app.logger.warn('%s - The configuration format you are using for solo revenue is deprecated and will be removed soon. Please take a look at the documentation for the new format.', self.id);
            self.config.miners = _.map(_.isArray(self.config.miner) ? self.config.miner : [ self.config.miner ], function (minerId) {
                return {
                    miner: minerId,
                    technical: self.config.technical,
                    market: self.config.market
                };
            });
            delete self.config.miner;
            delete self.config.technical;
            delete self.config.market;
        }

        self.config.miners.forEach(function (miner) {
            self.minerData[miner.miner] = {};

            self.app.on('update:data:' + miner.miner, function (data) {
                self.minerData[miner.miner].averageHashrate = data.averageHashrate || 0;
                self.calculateRevenue();
            });
            self.app.on('update:data:' + miner.technical, function (data) {
                self.minerData[miner.miner].probability = data.probability;
                self.minerData[miner.miner].blockReward = data.blockReward;
                self.minerData[miner.miner].coin = data.coin;
                self.calculateRevenue();
            });
            if (miner.market) {
                self.app.on('update:data:' + miner.market, function (data) {
                    self.minerData[miner.miner].price = data.close;
                    self.minerData[miner.miner].currency = data.currency;
                    self.calculateRevenue();
                });
            }
        });
    },

    calculateRevenue: function () {
        var self = this,
            minerData = self.minerData,
            minerTitles = {},
            data = {
                value: 0,
                interval: 'Day'
            };

        var allDataAvailable = true;
        _.each(self.config.miners, function (minerConfig) {
            var minerId = minerConfig.miner,
                module = _.find(self.app.modules, function (mod) { return mod.id === minerId; }),
                price = minerConfig.market ? minerData[minerId].price : 1,
                currency = minerConfig.market ? minerData[minerId].currency :  minerData[minerId].coin,
                revenue;

            minerTitles[minerId] = module ? module.title : minerId;

            allDataAvailable = allDataAvailable &&
                minerData[minerId].averageHashrate !== undefined &&
                minerData[minerId].probability !== undefined &&
                (!minerConfig.market || minerData[minerId].price !== undefined);
            if (!allDataAvailable) {
                return false;
            }

            if (data.currency !== undefined && currency !== data.currency) {
                self.app.logger.warn('%s - Trying to accumulate different currencies for solo revenue: %s vs %s', self.id, currency, data.currency);
            } else {
                data.currency = currency;
            }
            revenue = minerData[minerId].blockReward * (24 * 60 * 60) * minerData[minerId].averageHashrate * 1e6 * minerData[minerId].probability * price;

            data['revenue.' + minerId] = revenue;
            data.value += revenue;
        });

        data.minerTitles = minerTitles;
        if (allDataAvailable) {
            this.set(data);
        }
    }

});