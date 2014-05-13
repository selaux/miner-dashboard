'use strict';

var request = require('../../utils/request'),
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

        request('http://api.bitcoincharts.com/v1/markets.json').then(function (response) {
            self.app.logger.debug('%s - fetched markets from bitcoincharts.com', self.id, JSON.stringify(response));

            var market = _.find(response, function (market) {
                return market.symbol === self.config.symbol;
            });

            if (market) {
                self.set(_.clone(market));
            }
        }).catch(function (err) {
            self.app.logger.info('%s - error fetching markets from bitcoincharts.com', self.id, err.toString());
        });
    },

    set: setWithHistoricalData([ 'ask', 'bid', 'close' ], Module.prototype.set)

});