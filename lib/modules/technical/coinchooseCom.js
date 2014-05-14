'use strict';

var _ = require('lodash'),
    request = require('../../utils/request'),
    Module =require('../../Module');

module.exports = Module.extend({

    defaults: {
        interval: 6 * 60 * 60 * 1e3,
        coin: 'BTC'
    },

    viewId: 'technical',

    initialize: function () {
        var self = this;

        self.title = 'Coinchoose.com - ' + self.config.coin;

        setInterval(function () { self.updateStats(); }, self.config.interval);
        self.updateStats();
    },

    updateStats: function () {
        var self = this;

        request('http://www.coinchoose.com/api.php?base=BTC').then(function (response) {
            var coin = _.find(response, function (coin) {
                return coin.symbol === self.config.coin;
            });

            if (coin) {
                self.app.logger.debug('%s - fetched data from coinchoose.com', self.id, JSON.stringify(response));
                self.set({
                    coin: self.config.coin,
                    algorithm: coin.algo,
                    blockReward: parseFloat(coin.reward),
                    probability: 1 / (4295032833 * parseFloat(coin.difficulty)),
                    difficulty: parseFloat(coin.difficulty),
                    networkHashrate: parseFloat(coin.networkhashrate) / 1e6,
                    blockChainLength: parseFloat(coin.currentBlocks),
                    timeBetweenBlocks: parseFloat(coin.minBlockTime)
                });
            } else {
                self.app.logger.info('%s - error fetching data from coinchoose.com', self.id, 'Coin ' + self.config.coin + ' not found');
            }
        }).catch(function (err) {
            self.app.logger.info('%s - error fetching data from coinchoose.com', self.id, err.toString());
        });
    }
});