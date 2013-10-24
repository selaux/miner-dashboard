'use strict';

var net = require('net'),
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

        if (!self.socket) {
            self.socket = net.connect({
                host: self.config.host,
                port: self.config.port
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
    },

    handleResponse: function (rawData) {
        var self = this,
            response = JSON.parse(rawData.toString().replace('\x00', '')),
            data = _.extend({}, defaults, {
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
            });

        self.updateData(data);
    },

    renderView: function () {
        return this.template(_.extend({
            id: this.id,
            title: this.title
        }, this.data));
    }

});