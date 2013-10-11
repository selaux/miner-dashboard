'use strict';

var EventEmitter = require('events').EventEmitter,
    path = require('path'),
    uuid = require('uuid'),
    _ = require('lodash'),
    App;

App = function (config) {
    var self = this;

    this.modules = [];
    this.staticViews = {
        before: [],
        after: []
    };

    if (config.title) {
        this.staticViews.before.push({
            type: 'h1',
            value: config.title
        });
    }

    (config.modules || []).forEach(function (moduleConfig) {
        var Module = _.isFunction(moduleConfig.module) ? moduleConfig.module : require(path.join('./lib/modules/', moduleConfig.module)),
            module;

        if (!moduleConfig.id) {
            moduleConfig.id = uuid.v4();
        }

        module = new Module(self, moduleConfig);

        module.on('update:data', function (data) {
            self.updateData(moduleConfig.id, data);
        });

        module.on('update:view', function (viewData) {
            self.updateView(moduleConfig.id, viewData);
        });

        self.modules.push(module);
    });
};

_.extend(App.prototype, _.omit(EventEmitter.prototype, 'constructor'));

App.prototype.updateData = function (moduleId, data) {
    this.emit('update:data:' + moduleId, data);
};

App.prototype.updateView = function (moduleId, viewData) {
    this.emit('update:view:' + moduleId, viewData);
};

module.exports = App;
