'use strict';

var net = require('net'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    BfgAdapter,
    defaults = {
        miner: {
            connected: false
        }
    };

var BfgAdapter = function BfgAdapter(config) {
    var self = this;
    self.config = config;
    self.middlewares = [];
    self.data = defaults;
    self.interval = setInterval(function () { self.update(); }, self.config.bfgminer.interval);
    self.update();
};

BfgAdapter.prototype = Object.create(EventEmitter.prototype);

BfgAdapter.prototype.update = function () {
    var self = this,
        reportError = function (err) {
            self.handleStatusUpdate(_.extend({}, defaults, {
                miner: {
                    connected: false,
                    error: err.toString()
                }
            }));
        };

    if (!self.socket) {
        self.socket = net.connect({
            host: self.config.bfgminer.host,
            port: self.config.bfgminer.port
        }, function () {
            if (self.socket) {
                self.socket.on('data', function (data) {
                    self.handleResponse(data);
                });
                self.socket.on('end', function () {
                    self.socket.removeAllListeners();
                    self.socket = null;
                });
                self.socket.write(JSON.stringify({
                    command: 'summary',
                    parameter: ''
                }));
            }
        });

        self.socket.on('error', function (err) {
            self.socket = null;
            reportError(err);
        });
    }
};

BfgAdapter.prototype.handleResponse = function (rawData) {
    var self = this,
        response = JSON.parse(rawData.toString().replace('\x00', '')),
        data = _.extend({}, defaults, {
            miner: {
                connected: true,
                description: response.STATUS[0].Description,
                avgHashrate: response.SUMMARY[0]['MHS av'],
                hardwareErrors: response.SUMMARY[0]['Hardware Errors'],
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
            }
        });

    self.handleStatusUpdate(data);
};

BfgAdapter.prototype.handleStatusUpdate = function (data) {
    var self = this,
        emit = function () {
            self.emit('statusUpdate', self.data);
        },
        counter = 0;

    self.data = data;

    if (self.middlewares.length > 0) {
        self.middlewares.forEach(function (mw) {
            mw(self.data, function (err) {
                if (err) {
                    throw err;
                }

                counter = counter + 1;
                if (counter === self.middlewares.length) {
                    emit();
                }
            });
        });
    } else {
        emit();
    }
};

BfgAdapter.prototype.use = function (middleware) {
    this.middlewares.push(middleware);
};

module.exports = BfgAdapter;