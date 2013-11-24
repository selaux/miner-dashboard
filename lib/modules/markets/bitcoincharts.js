'use strict';

var request = require('request'),
    _ = require('lodash'),

    Module = require('../../Module'),
    intervalTime,
    interval;

module.exports = Module.extend({
    defaults: {
        interval: 60 * 60 * 1e3,
        symbol: 'mtgoxUSD'
    },

    template: 'market',

    initialize: function () {
        var self = this;

        self.title = self.config.symbol + ' Market @ Bitcoin Charts';

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
            if (err) {
                return;
            }
            if (res.statusCode !== 200) {
                return;
            }

            var market = _.filter(res.body, function (market) {
                return market.symbol === self.config.symbol;
            })[0];

            if (market) {
                self.updateData(market);
            }
        });
    }

});