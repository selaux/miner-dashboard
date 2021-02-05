'use strict';

var net = require('net'),
    Bluebird = require('bluebird'),
    _ = require('lodash'),
    moment = require('moment'),

    Module = require('../../Module'),
    setWithHistoricalData = require('../../utils/setWithHistoricalData'),
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
        var self = this;

        Bluebird.all([
            self.sendCommand('summary'),
            self.sendCommand('devs'),
            self.sendCommand('pools')
        ]).then(function (results) {
            self.app.logger.debug('%s - fetched miner data', self.id, JSON.stringify(results));

            var data = _.clone(self.handleSummaryResponse(results[0]));
            data.devices = self.handleDevsResponse(results[1]);
            data.pools = self.handlePoolsResponse(results[2]);

            if (data.currentHashrate === undefined) {
                data.currentHashrate = _(data.devices).map('currentHashrate').reduce(function(sum, num) {
                    return sum + num;
                });
            }

            self.set(data);
        }).catch(function (err) {
            self.app.logger.info('%s - error fetching miner data', self.id, err.toString());
            self.set(_.extend({}, defaults, {
                connected: false,
                currentHashrate: 0,
                error: err.toString()
            }));
        });
    },

    sendCommand: function (command, parameter) {
        var data = '',
            self = this,
            errored = false,
            socket;

        parameter = parameter || '';
        return new Bluebird(function (resolve, reject) {
            var onError = function (err) {
                    err = err || new Error('ETIMEOUT');

                    socket.removeAllListeners();
                    socket.destroy();
                    errored = true;
                    reject(err);
                };

            socket = net.connect({
                host: self.config.host,
                port: self.config.port
            }, function () {
                socket.on('data', function (rawData) {
                    data += rawData.toString();
                });
                socket.on('end', function () {
                    socket.removeAllListeners();
                    if (!errored) {
                        try {
                            socket.end();
                            resolve(JSON.parse(data.replace('\x00', '')));
                        } catch (e) {
                            reject(e);
                        }
                    }
                });
                socket.write(JSON.stringify({
                    command: command,
                    parameter: parameter
                }));
            });

            socket.setTimeout(self.config.interval);
            socket.on('error', onError);
            socket.on('timeout', onError);
        });
    },

    handleSummaryResponse: function (response) {
        var data,
            calculatedHardwareErrorRate,
            returnedHardwareErrorRate,
            hardwareErrorRate,
            currentHashrateKey,
            currentHashrate,
            averageHashrate,
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
            averageHashrate = response.SUMMARY[0]['MHS av'] !== undefined ? response.SUMMARY[0]['MHS av'] : response.SUMMARY[0]['GHS av'] * 1000;
            totalDifficulty = response.SUMMARY[0]['Difficulty Accepted'] + response.SUMMARY[0]['Difficulty Rejected'] + response.SUMMARY[0]['Difficulty Stale'];

            data = _.extend({}, defaults, {
                connected: true,
                elapsed: response.SUMMARY[0].Elapsed,
                description: response.STATUS[0].Description,
                averageHashrate: averageHashrate,
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

        _(pools).each(function (pool) {
            pool.active = _.max(pools, function (other) { return other.lastShareTime; }).id === pool.id;
        });

        return _(pools).sortBy(function (pool) {
            return pool.priority;
        }).value();
    },

    set: setWithHistoricalData([ 'currentHashrate' ], Module.prototype.set),

    getViewData: function () {
        return this.data.connected ? this.data : {};
    }

});