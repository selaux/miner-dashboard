'use strict';

var _ = require('lodash'),
    request = require('request'),
    technicalStats = {};

function updateTechnicalStats() {
    var data = {},
        callbacks = 0,
        finished = function () {
            callbacks = callbacks + 1;
            if (callbacks === 3) {
                technicalStats = data;
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

updateTechnicalStats();
setInterval(updateTechnicalStats, 60 * 60 * 1e3);

module.exports = function (data, callback) {
    data.technical = technicalStats;
    callback(null);
};