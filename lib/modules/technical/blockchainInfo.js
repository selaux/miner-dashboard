'use strict';

var Bluebird = require('bluebird'),
    request = require('../../utils/request'),
    Module =require('../../Module');

module.exports = Module.extend({

    defaults: {
        interval: 6 * 60 * 60 * 1e3
    },

    viewId: 'technical',

    initialize: function () {
        var self = this;

        self.title = 'Blockchain.info';

        setInterval(function () { self.updateTechnicalStats(); }, self.config.interval);
        self.updateTechnicalStats();
    },

    updateTechnicalStats: function () {
        var self = this;

        Bluebird.all([
            request('https://blockchain.info/stats?format=json'),
            request('https://blockchain.info/q/bcperblock')
        ]).then(function (responses) {
            /*jshint sub:true*/
            self.app.logger.debug(
                '%s - fetched data from blockchain.info',
                self.id,
                JSON.stringify(responses)
            );

            self.set({
                coin: 'BTC',
                algorithm: 'SHA-256',
                blockReward: responses[1] / 1e8,
                probability: 1 / (4295032833 * responses[0].difficulty),
                difficulty: responses[0].difficulty,
                networkHashrate: responses[0]['hash_rate'] * 1e3,
                blockChainLength: responses[0]['n_blocks_total'],
                timeBetweenBlocks: responses[0]['minutes_between_blocks'],
                numberOfTransactions: responses[0]['n_tx'],
                totalTransactionValue: responses[0]['total_btc_sent']
            });
        }).catch(function (err) {
            self.app.logger.info('%s - error fetching data from blockchain.info', self.id, err.toString());
        });
    }

});