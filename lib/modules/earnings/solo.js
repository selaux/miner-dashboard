'use strict';

var Module = require('../../Module');

module.exports = Module.extend({

    initialize: function () {
        var self = this;

        [ 'miner', 'market', 'technical' ].forEach(function (prop) {
            self.app.on('update:data:' + self.config[prop], function (data) {
                self[prop + 'Data'] = data;
                self.calculateEarnings();
            });
        });
    },

    calculateEarnings: function () {
        if (!this.technicalData || !this.minerData || !this.marketData) {
            return;
        }

        this.updateData({
            value: this.technicalData.btcPerBlock * (24 * 60 * 60) * this.minerData.avgHashrate * 1e6 * this.technicalData.probability * this.marketData.ask,
            currency: this.marketData.currency,
            interval: 'Day'
        });
    }
    
});