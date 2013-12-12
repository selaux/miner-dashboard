'use strict';

var net = require('net'),
    async = require('async'),
    _ = require('lodash'),

    Module = require('../../ServerModule'),
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

                    callback(null, self.handleDevsResponse(data));
                });
            },
            function (callback) {
                self.sendCommand('pools', '', function (err, data) {
                    if (err) {
                        return callback(err);
                    }

                    callback(null, self.handlePoolsResponse(data));
                });
            }
        ], function (err, results) {
            var data = results[0],
                devices = results[1],
                pools = results[2];

            if (err) {
                reportError(err);
            } else {
                data.devices = devices;
                data.pools = pools;
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
        var data,
            calculatedHardwareErrorRate,
            returnedHardwareErrorRate,
            hardwareErrorRate;

        if (response.SUMMARY && response.SUMMARY.length > 0) {
            calculatedHardwareErrorRate = (response.SUMMARY[0]['Hardware Errors'] / response.SUMMARY[0].Accepted) * 100;
            returnedHardwareErrorRate = response.SUMMARY[0]['Device Hardware%'];
            hardwareErrorRate = returnedHardwareErrorRate !== undefined ? returnedHardwareErrorRate : calculatedHardwareErrorRate;

            data = _.extend({}, defaults, {
                connected: true,
                elapsed: response.SUMMARY[0].Elapsed,
                description: response.STATUS[0].Description,
                avgHashrate: response.SUMMARY[0]['MHS av'],
                hardwareErrors: response.SUMMARY[0]['Hardware Errors'],
                hardwareErrorRate: hardwareErrorRate,
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
                    stale: response.SUMMARY[0]['Difficulty Stale']
                }
            });
        } else {
            data = {
                connected: false
            };
        }
        return data;
    },

    handleDevsResponse: function (response) {
        return _.map(response.DEVS, function (rawDev) {
            var avgHashrateKey = _.find(_.keys(rawDev), function (key) {
                    return key.match(/^MHS\s[0-9]+s$/g);
                }),
                calculatedHardwareErrorRate = (rawDev['Hardware Errors'] / rawDev.Accepted) * 100,
                returnedHardwareErrorRate = rawDev['Device Hardware%'],
                hardwareErrorRate = returnedHardwareErrorRate !== undefined ? returnedHardwareErrorRate : calculatedHardwareErrorRate;

            return {
                id: rawDev.ID,
                connected: (rawDev.Status === 'Alive'),
                description: rawDev.Name,
                avgHashrate: rawDev[avgHashrateKey],
                hardwareErrors: rawDev['Hardware Errors'],
                hardwareErrorRate: hardwareErrorRate
            };
        });
    },

    handlePoolsResponse: function (response) {
        return _(response.POOLS).map(function (pool) {
            return {
                alive: pool.Status === 'Alive',
                active: _(response.POOLS).without(function (other) { return pool.POOL === other.POOL;}).all(function (other) { return other['Last Share Time'] <= pool['Last Share Time']; }),
                id: pool.POOL,
                priority: pool.Priority,
                url: pool.URL,
                lastShareTime: pool['Last Share Time'] === 0 ? undefined : new Date(pool['Last Share Time'] * 1000)
            };
        }).sortBy(function (pool) {
            return pool.priority;
        }).value();
    },

    getViewData: function () {
        return this.data.connected ? this.data : {};
    }

});