'use strict';

var request = require('request'),

    Module = require('../../Module'),
    intervalTime,
    interval;

module.exports = Module.extend({
    defaults: {
        interval: 60 * 60 * 1e3,
        symbol: 'mtgoxUSD'
    },

    initialize: function () {
        var self = this;

        if (interval && self.config.interval < intervalTime) {
            clearInterval(interval);
        }
        if (!interval) {
            intervalTime = self.config.interval;
            interval = setInterval(function () {
                self.updateMarketStats();
            }, self.config.interval);
        }
        self.updateMarketStats();
    },

    updateMarketStats: function () {
        var self = this;

        request({
            uri:  'http://api.bitcoincharts.com/v1/markets.json',
            json: true
        }, function (err, res) {
            var market = res.body.filter(function (market) {
                return market.symbol === self.config.symbol;
            })[0];

            self.updateData(market);
        });
    }
});