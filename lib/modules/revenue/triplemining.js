'use strict';

var async = require('async'),
    request = require('request'),
    _ = require('lodash'),

    Module = require('../../Module');

module.exports = Module.extend({

    viewId: 'revenue',

    defaults: {
        interval: 3600000
    },

    initialize: function () {
        var self = this;

        this.title = this.config.title || 'Revenue';

        self.app.on('update:data:' + self.config.technical, function (data) {
            self.technicalData = data;
            self.calculateRevenue();
        });

        if (self.config.market) {
            self.app.on('update:data:' + self.config.market, function (data) {
                self.marketData = data;
                self.calculateRevenue();
            });
        }

        this.interval = setInterval(function () {
            self.updateTripleminingData();
        }, self.config.interval);
        self.updateTripleminingData();
    },

    updateTripleminingData: function () {
        var self = this;

        async.parallel([
            function (callback) {
                request({
                    uri:  'https://api.triplemining.com/json/stats',
                    json: true
                }, function (err, res) { callback(err, res); });
            },
            function (callback) {
                request({
                    uri:  'https://api.triplemining.com/json/' + self.config.apiKey,
                    json: true
                }, function (err, res) { callback(err, res); });
            }
        ], function (err, responses) {
            /*jshint sub:true*/

            var allRequestsSucceeded;

            if (err) {
                return;
            }

            allRequestsSucceeded = _.all(responses, function (res) {
                return res.statusCode === 200;
            });
            if (!allRequestsSucceeded) {
                return;
            }

            self.tripleminingData = {
                hashrate: responses[0].body.hashrate * 1e3,
                estimatedPayout: responses[1].body['estimated_payout']
            };
            self.calculateRevenue();
        });
    },

    calculateRevenue: function () {
        var currency,
            bid;

        if (!this.technicalData) {
            return;
        }
        if (this.config.market && !this.marketData) {
            return;
        }
        if (!this.tripleminingData) {
            return;
        }

        currency = this.config.market ? this.marketData.currency : 'BTC';
        bid = this.config.market ? this.marketData.bid : 1;

        this.updateData({
            currency: currency,
            value: this.tripleminingData.hashrate * 1e6 * this.technicalData.probability * this.tripleminingData.estimatedPayout * bid * 24 * 3600,
            interval: 'Day'
        });
    }

});