'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),

    Module =require('../../Module');

module.exports = Module.extend({

    defaults: {
        interval: 6 * 60 * 60 * 1e3
    },

    template: 'technical',

    initialize: function () {
        var self = this;

        self.title = 'Blockchain.info';

        setInterval(function () { self.updateTechnicalStats(); }, self.config.interval);
        self.updateTechnicalStats();
    },

    updateTechnicalStats: function () {
        var self = this;

        async.parallel([
            function (callback) {
                request({
                    uri:  'http://blockchain.info/de/stats?format=json',
                    json: true
                }, callback);
            },
            function (callback) {
                request({
                    uri:  'http://blockexplorer.com/q/bcperblock',
                    json: true
                }, callback);
            },
            function (callback) {
                request({
                    uri:  'http://blockchain.info/de/q/probability',
                    json: true
                }, callback);
            }
        ], function (err, responses) {
            var data;

            if (!err) {
                data = _.extend(responses[0].body, {
                    btcPerBlock: responses[1].body,
                    probability: responses[2].body
                });
                self.updateData(data);
            }
        });
    }

});