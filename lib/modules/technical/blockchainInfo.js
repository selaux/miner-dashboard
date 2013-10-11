'use strict';

var _ = require('lodash'),
    request = require('request'),

    Module =require('../../Module');

module.exports = Module.extend({

    defaults: {
        interval: 6 * 60 * 60 * 1e3
    },

    initialize: function () {
        var self = this;

        setInterval(function () { self.updateTechnicalStats(); }, self.config.interval);
        self.updateTechnicalStats();
    },

    updateTechnicalStats: function () {
        var self = this,
            data = {},
            callbacks = 0,
            finished = function () {
                callbacks = callbacks + 1;
                if (callbacks === 3) {
                    self.updateData(data);
                }
            };

        request({
            uri:  'http://blockchain.info/de/stats?format=json',
            json: true
        }, function (err, res) {
            _.extend(data, res.body);
            finished();
        });

        request({
            uri:  'http://blockexplorer.com/q/bcperblock',
            json: true
        }, function (err, res) {
            data.btcPerBlock = res.body;
            finished();
        });

        request({
            uri:  'http://blockchain.info/de/q/probability',
            json: true
        }, function (err, res) {
            data.probability = res.body;
            finished();
        });
    }

});