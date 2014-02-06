'use strict';

var async = require('async'),
    _ = require('lodash'),
    request = require('request'),

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

        async.parallel([
            function (callback) {
                request({
                    uri:  'http://blockchain.info/stats?format=json',
                    json: true
                }, function (err, res) { callback(err, res); });
            },
            function (callback) {
                request({
                    uri:  'http://blockchain.info/q/bcperblock',
                    json: true
                }, function (err, res) { callback(err, res); });
            }
        ], function (err, responses) {
            /*jshint sub:true*/

            var allRequestsSucceeded,
                difficulty;

            if (err) {
                return;
            }

            allRequestsSucceeded = _.all(responses, function (res) {
                return res.statusCode === 200;
            });
            if (!allRequestsSucceeded) {
                return;
            }

            difficulty = responses[0].body.difficulty;
            self.updateData(_.extend(responses[0].body, {
                btcPerBlock: responses[1].body / 1e8,
                probability: 1 / (4295032833 * difficulty),
                'hash_rate': responses[0].body['hash_rate'] * 1e3
            }));
        });
    }

});