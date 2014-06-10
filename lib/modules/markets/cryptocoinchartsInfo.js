'use strict';

var request = require('../../utils/request'),
    Module = require('../../Module'),
    setWithHistoricalData = require('../../utils/setWithHistoricalData');

module.exports = Module.extend({
    defaults: {
        interval: 60 * 60 * 1e3,
        tradingPair: 'btc_usd',
        chartTimespan: 14 * 24 * 60 * 60 * 1000,
        chartPrecision: 60 * 60 * 1000
    },

    viewId: 'market',

    initialize: function () {
        var self = this;

        self.title = self.config.tradingPair + ' Market @ Cryptocoincharts.info';

        self.interval = setInterval(function () {
            self.updateMarketStats();
        }, self.config.interval);
        self.updateMarketStats();
    },

    updateMarketStats: function () {
        var self = this;

        request('http://www.cryptocoincharts.info/v2/api/tradingPair/' + self.config.tradingPair).then(function (response) {
            /*jshint sub:true*/

            self.app.logger.debug('%s - fetched markets from cryptocoincharts.info', self.id, JSON.stringify(response));


            self.set({
                close: parseFloat(response.price),
                currency: response.id.split('/')[1].toUpperCase(),
                bestMarket: response['best_market']
            });
        }).catch(function (err) {
            self.app.logger.info('%s - error fetching markets from cryptocoincharts.info', self.id, err.toString());
        });
    },

    set: setWithHistoricalData([ 'close' ], Module.prototype.set)

});