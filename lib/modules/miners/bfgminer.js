'use strict';

var net = require('net'),
    async = require('async'),
    _ = require('lodash'),
    moment = require('moment'),

    Module = require('../../Module'),
    defaults = {
        connected: false
    };

module.exports = Module.extend({

    defaults: {
        host: '127.0.0.1',
        port: 4028,
        interval: 1000,
        chartTimespan: 24 * 60 * 60 * 1000,
        chartPrecision: 5 * 60 * 1000
    },

    viewId: 'miner',

    initialize: function () {
        var self = this;

        self.title = self.config.title || self.id;

        self.interval = setInterval(function () { self.update(); }, self.config.interval);
        self.update();
    },

    update: function () {
        var self = this,
            reportError = function (err) {
                self.set(_.extend({}, defaults, {
                    connected: false,
                    currentHashrate: 0,
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
                if (data.currentHashrate === undefined) {
                    data.currentHashrate = _(data.devices).pluck('currentHashrate').reduce(function(sum, num) {
                        return sum + num;
                    });
                }
                self.set(data);
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
            hardwareErrorRate,
            currentHashrateKey,
            currentHashrate,
            totalDifficulty;

        if (response.SUMMARY && response.SUMMARY.length > 0) {
            calculatedHardwareErrorRate = (response.SUMMARY[0]['Hardware Errors'] / response.SUMMARY[0].Accepted) * 100;
            returnedHardwareErrorRate = response.SUMMARY[0]['Device Hardware%'];
            hardwareErrorRate = returnedHardwareErrorRate !== undefined ? returnedHardwareErrorRate : calculatedHardwareErrorRate;
            currentHashrateKey = _.find(_.keys(response.SUMMARY[0]), function (key) {
                return key.match(/^MHS\s[0-9]+s$/g) || key.match(/^GHS\s[0-9]+s$/g);
            });
            if (currentHashrateKey) {
                currentHashrate = currentHashrateKey.indexOf('GHS') === 0 ? response.SUMMARY[0][currentHashrateKey] * 1000 : response.SUMMARY[0][currentHashrateKey];
            } else {
                currentHashrate = undefined;
            }
            totalDifficulty = response.SUMMARY[0]['Difficulty Accepted'] + response.SUMMARY[0]['Difficulty Rejected'] + response.SUMMARY[0]['Difficulty Stale'];

            data = _.extend({}, defaults, {
                connected: true,
                elapsed: response.SUMMARY[0].Elapsed,
                description: response.STATUS[0].Description,
                currentHashrate: currentHashrate,
                hardwareErrors: response.SUMMARY[0]['Hardware Errors'],
                hardwareErrorRate: hardwareErrorRate,
                shares: {
                    accepted: response.SUMMARY[0].Accepted,
                    rejected: response.SUMMARY[0].Rejected,
                    rejectedPercentage: totalDifficulty ? 100 * response.SUMMARY[0]['Difficulty Rejected'] / totalDifficulty : 0,
                    best: response.SUMMARY[0]['Best Share'],
                    stale: response.SUMMARY[0].Stale,
                    stalePercentage: totalDifficulty ? 100 * response.SUMMARY[0]['Difficulty Stale'] / totalDifficulty : 0,
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
            var currentHashrateKey = _.find(_.keys(rawDev), function (key) {
                    return key.match(/^MHS\s[0-9]+s$/g);
                }),
                calculatedHardwareErrorRate = (rawDev['Hardware Errors'] / rawDev.Accepted) * 100,
                returnedHardwareErrorRate = rawDev['Device Hardware%'],
                hardwareErrorRate = returnedHardwareErrorRate !== undefined ? returnedHardwareErrorRate : calculatedHardwareErrorRate;

            return {
                id: rawDev.ID,
                connected: (rawDev.Status === 'Alive'),
                description: rawDev.Name,
                currentHashrate: rawDev[currentHashrateKey],
                hardwareErrors: rawDev['Hardware Errors'],
                hardwareErrorRate: hardwareErrorRate,
                temperature: rawDev.Temperature
            };
        });
    },

    handlePoolsResponse: function (response) {
        var pools = _.map(response.POOLS, function (pool) {
            var hasLastShareTime,
                lastShareTimeIsElapsedTimeString = typeof pool['Last Share Time'] === 'string',
                lastShareTime,
                elapsedUnits;

            if (lastShareTimeIsElapsedTimeString) {
                hasLastShareTime = pool['Last Share Time'] !== '0';
                if (hasLastShareTime) {
                    elapsedUnits = pool['Last Share Time'].split(':').map(function (str) {
                        return parseInt(str, 10);
                    });
                    lastShareTime = moment()
                        .startOf('minute')
                        .subtract('hours', elapsedUnits[0])
                        .subtract('minutes', elapsedUnits[1])
                        .subtract('seconds', elapsedUnits[2])
                        .toDate()
                        .getTime();
                }
            } else {
                hasLastShareTime = pool['Last Share Time'] !== 0;
                if (hasLastShareTime) {
                    lastShareTime = pool['Last Share Time'] * 1000;
                }
            }

            return {
                alive: pool.Status === 'Alive',
                id: pool.POOL,
                priority: pool.Priority,
                url: pool.URL,
                lastShareTime: !hasLastShareTime ? undefined : lastShareTime
            };
        });

        return _(pools).each(function (pool) {
            pool.active = _.max(pools, function (other) { return other.lastShareTime; }).id === pool.id;
        })
        .sortBy(function (pool) {
            return pool.priority;
        }).value();
    },

    set: function () {
        var self = this,
            attributes = arguments[0],
            historicalData = this.get('historicalData') || [],
            now = new Date().getTime(),
            lastUnfilledDataElement = _.findLast(historicalData, function (el) { return el.source !== undefined;  }),
            sourceElement = { timestamp: now, currentHashrate: attributes.currentHashrate },
            fullElement = { source: [ sourceElement ] };

        historicalData = historicalData.filter(function (observation) {
            return observation.timestamp > (now - self.config.chartTimespan);
        });
        if (lastUnfilledDataElement) {
            lastUnfilledDataElement.source.push(sourceElement);
        } else {
            if (historicalData.length > 1) {
                fullElement.source.push({ timestamp: now, currentHashrate: historicalData[historicalData.length-2].currentHashrate });
            }
            historicalData.push(fullElement);
        }
        historicalData = this.buildMeanValue(historicalData);

        attributes.historicalData = historicalData;
        arguments[0] = attributes;

        Module.prototype.set.apply(this, arguments);
    },

    buildMeanValue: function (historicalData) {
        var self = this,
            sum = function (sum, value) { return sum + value; },
            lastDataElement = _.last(historicalData);

        lastDataElement.currentHashrate = _(lastDataElement.source).pluck('currentHashrate').reduce(sum) / lastDataElement.source.length;
        lastDataElement.timestamp = _(lastDataElement.source).pluck('timestamp').reduce(sum) / lastDataElement.source.length;

        if (historicalData.length === 1) {
            if (_.last(lastDataElement.source).timestamp - lastDataElement.source[0].timestamp > self.config.chartPrecision) {
                delete lastDataElement.source;
            }
        } else {
            if (lastDataElement.timestamp - historicalData[historicalData.length-2].timestamp > self.config.chartPrecision) {
                delete lastDataElement.source;
            }
        }

        return historicalData;
    },

    getViewData: function () {
        return this.data.connected ? this.data : {};
    }

});