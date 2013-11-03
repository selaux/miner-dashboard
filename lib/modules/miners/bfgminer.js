'use strict';

var net = require('net'),
    async = require('async'),
    _ = require('lodash'),

    Module = require('../../Module'),
    defaults = {
        connected: false
    };

module.exports = Module.extend({

    defaults: {
        host: '127.0.0.1',
        port: 4028,
        interval: 1000
    },

    template: 'miner',

    initialize: function () {
        var self = this;

        self.title = self.config.title || self.id;

        self.interval = setInterval(function () { self.update(); }, self.config.interval);
        self.update();
    },

    update: function () {
        var self = this,
            reportError = function (err) {
                self.updateData(_.extend({}, defaults, {
                    connected: false,
                    error: err.toString()
                }));
            };

        async.parallel([
            function (callback) {
                self.sendCommand('summary', '', function (err, data) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, self.handleSummaryResponse(data));
                });
            },
            function (callback) {
                self.sendCommand('devs', '', function (err, data) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, self.handleDevicesResponse(data));
                });
            }
        ], function (err, results) {
            var data = results[0],
                devices = results[1];

            if (err) {
                reportError(err);
            } else {
                data.devices = devices;
                self.updateData(data);
            }
        });
    },

    sendCommand: function (command, parameter, callback) {
        var data = '',
            self = this,
            socket;

        socket = net.connect({
            host: self.config.host,
            port: self.config.port
        }, function () {
            var json;

            socket.on('data', function (rawData) {
                data += rawData.toString();
            });
            socket.on('end', function () {
                socket.removeAllListeners();
                if (callback) {
                    try {
                        json = JSON.parse(data.replace('\x00', ''));
                    } catch (e) {
                        return callback(e);
                    }
                    callback(null, json);
                }
            });
            socket.write(JSON.stringify({
                command: command,
                parameter: parameter
            }));
        });

        socket.on('error', function (err) {
            socket.removeAllListeners();
            callback(err);
            callback = null;
        });
    },

    handleSummaryResponse: function (response) {
        var data = _.extend({}, defaults, {
                connected: true,
                description: response.STATUS[0].Description,
                avgHashrate: response.SUMMARY[0]['MHS av'],
                hardwareErrors: response.SUMMARY[0]['Hardware Errors'],
                hardwareErrorRate: response.SUMMARY[0]['Hardware Errors'] / response.SUMMARY[0].Accepted,
                shares: {
                    accepted: response.SUMMARY[0].Accepted,
                    rejected: response.SUMMARY[0].Rejected,
                    best: response.SUMMARY[0]['Best Share'],
                    stale: response.SUMMARY[0].Stale,
                    discarded: response.SUMMARY[0].Discarded
                },
                difficulty: {
                    accepted: response.SUMMARY[0]['Difficulty Accepted'],
                    rejected: response.SUMMARY[0]['Difficulty Rejected'],
                    stale: response.SUMMARY[0]['Difficulty Stale'],
                }
            });

        return data;
    },

    handleDevicesResponse: function (response) {
        return response.DEVS.map(function (rawDev) {
            var avgHashrateKey = _.find(_.keys(rawDev), function (key) {
                return key.match(/^MHS\s[0-9]+s$/g);
            });

            return {
                id: rawDev.ID,
                connected: (rawDev.Status === 'Alive'),
                description: rawDev.Name,
                avgHashrate: rawDev[avgHashrateKey],
                hardwareErrors: rawDev['Hardware Errors'],
                hardwareErrorRate: rawDev['Hardware Errors'] / rawDev.Accepted
            };
        });
    },

    getViewData: function () {
        return this.data.connected ? this.data : {};
    }

});