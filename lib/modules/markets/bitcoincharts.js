'use strict';

var request = require('request'),
    _ = require('lodash'),

    Module = require('../../Module'),
    setWithHistoricalData = require('../../utils/setWithHistoricalData'),
    intervalTime,
    interval;

module.exports = Module.extend({
    defaults: {
        interval: 60 * 60 * 1e3,
        symbol: 'btceUSD',
        chartTimespan: 14 * 24 * 60 * 60 * 1000,
        chartPrecision: 60 * 60 * 1000
    },

    viewId: 'market',

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
                self.app.logger.info('%s - error fetching markets from bitcoincharts.com', self.id, err);
                return;
            }
            self.app.logger.debug('%s - fetched markets from bitcoincharts.com', self.id, JSON.stringify(res.statusCode), JSON.stringify(res.body));
            if (res.statusCode !== 200) {
                return;
            }

            var market = _.filter(res.body, function (market) {
                return market.symbol === self.config.symbol;
            })[0];

            if (market) {
                self.set(_.clone(market));
            }
        });
    },

    set: setWithHistoricalData([ 'ask', 'bid', 'close' ], Module.prototype.set)

});