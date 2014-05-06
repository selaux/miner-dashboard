'use strict';

var nodemailer = require('nodemailer'),
    _ = require('lodash'),

    Module = require('../../Module');

module.exports = Module.extend({

    defaults: {
        transport: {},
        from: 'miner-dashboard@server',
        to: [],
        cc: [],
        notifyOn: {
            minAvgHashrate: 0,
            disconnect: true
        }
    },

    initialize: function () {
        var self = this;

        self.data = {};
        self.notifiedForHashrate = [];
        self.notifiedForDisconnect = [];
        self.transport = nodemailer.createTransport('SMTP', this.config.transport);

        if (_.isFunction(this.config.notifyOn)) {
            this.findNotifications = this.config.notifyOn;
        }

        this.app.modules.forEach(function (module) {
            module.on('update:data', function (data) {
                var notifications = self.getNotifications(module.id, data);

                notifications.forEach(function (notification) {
                    self.app.logger.info('%s - sending notification', self.id, notification);
                    self.transport.sendMail({
                        from: self.config.from,
                        to: self.config.to,
                        cc: self.config.cc,
                        subject: self.app.title + ': Status Update',
                        text: notification
                    });
                });
            });
        });
    },

    getNotifications: function (moduleId, data) {
        var notifications = [];

        notifications = notifications.concat(this.getNotificationsForMinAvgHashrate(moduleId, data));
        notifications = notifications.concat(this.getNotificationsForDisconnects(moduleId, data));

        return notifications;
    },

    getNotificationsForMinAvgHashrate: function (moduleId, data) {
        var self = this,
            notifications = [],
            minAvgHashrateConfig = this.config.notifyOn.minAvgHashrate,
            notifyOnHashrate = function (minAvgHashrate) {
                if (_.isNumber(data.averageHashrate) && data.averageHashrate <= minAvgHashrate) {
                    if (!_.contains(self.notifiedForHashrate, moduleId)) {
                        notifications.push('Hashrate ' + data.averageHashrate + ' MH/s of ' + moduleId + ' has dropped below ' + minAvgHashrate + ' MH/s');
                        self.notifiedForHashrate.push(moduleId);
                    }
                } else {
                    self.notifiedForHashrate = _.without(self.notifiedForHashrate, moduleId);
                }
            };

        if (minAvgHashrateConfig || minAvgHashrateConfig === 0) {
            if (_.isNumber(minAvgHashrateConfig)) {
                notifyOnHashrate(minAvgHashrateConfig);
            } else {
                if (minAvgHashrateConfig[moduleId]) {
                    notifyOnHashrate(minAvgHashrateConfig[moduleId]);
                }
            }
        }

        return notifications;
    },

    getNotificationsForDisconnects: function (moduleId, data) {
        var self = this,
            notifications = [];

        if (this.config.notifyOn.disconnect) {
            if (data.connected !== undefined && !data.connected) {
                if (!_.contains(self.notifiedForDisconnect, moduleId)) {
                    notifications.push(moduleId + ' has disconnected');
                    self.notifiedForDisconnect.push(moduleId);
                }
            } else {
                self.notifiedForDisconnect = _.without(self.notifiedForDisconnect, moduleId);
            }
        }

        return notifications;
    }

});