'use strict';

var fs = require('fs'),
    path = require('path'),

    Handlebars = require('handlebars'),
    _ = require('lodash'),

    Module = require('../../Module'),

    earningsTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../../../templates/earnings.hbs')).toString());

module.exports = Module.extend({

    initialize: function () {
        var self = this;

        this.title = this.config.title || 'Earnings';

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
            value: this.technicalData.btcPerBlock * (24 * 60 * 60) * (this.minerData.avgHashrate || 0) * 1e6 * this.technicalData.probability * this.marketData.ask,
            currency: this.marketData.currency,
            interval: 'Day'
        });
    },

    renderView: function () {
        return earningsTemplate(_.extend({
            id: this.id,
            title: this.title
        }, this.data, {
            value: this.data.value.toFixed(6)
        }));
    }
    
});