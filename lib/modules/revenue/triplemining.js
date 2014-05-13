'use strict';

var Bluebird = require('bluebird'),
    request = require('../../utils/request'),
    setWithHistoricalData = require('../../utils/setWithHistoricalData'),
    Module = require('../../Module');

module.exports = Module.extend({

    viewId: 'revenue',

    defaults: {
        interval: 3600000,
        chartTimespan: 14 * 24 * 60 * 60 * 1000,
        chartPrecision: 60 * 60 * 1000
    },

    initialize: function () {
        var self = this;

        this.title = this.config.title || 'Revenue';

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

        this.interval = setInterval(function () {
            self.updateTripleminingData();
        }, self.config.interval);
        self.updateTripleminingData();
    },

    updateTripleminingData: function () {
        var self = this;

        Bluebird.all([
                request('https://api.triplemining.com/json/stats'),
                request('https://api.triplemining.com/json/' + self.config.apiKey)
        ]).then(function (responses) {
            /*jshint sub:true*/

            self.app.logger.debug(
                '%s - fetched revenue estimate from triplemining',
                self.id,
                JSON.stringify(responses)
            );

            self.tripleminingData = {
                hashrate: responses[0].hashrate * 1e3,
                estimatedPayout: responses[1]['estimated_payout']
            };
            self.calculateRevenue();
        }).catch(function (err) {
            self.app.logger.info('%s - error fetching revenue estimate from triplemining', self.id, err.toString());
        });
    },

    calculateRevenue: function () {
        var currency,
            bid;

        if (!this.technicalData) {
            return;
        }
        if (this.config.market && !this.marketData) {
            return;
        }
        if (!this.tripleminingData) {
            return;
        }

        currency = this.config.market ? this.marketData.currency : 'BTC';
        bid = this.config.market ? this.marketData.bid : 1;

        this.set({
            currency: currency,
            value: this.tripleminingData.hashrate * 1e6 * this.technicalData.probability * this.tripleminingData.estimatedPayout * bid * 24 * 3600,
            interval: 'Day'
        });
    },

    set: setWithHistoricalData([ 'value' ], Module.prototype.set)

});