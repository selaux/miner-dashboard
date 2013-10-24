'use strict';

var EventEmitter = require('eventemitter2').EventEmitter2,
    crypto = require('crypto'),
    _ = require('lodash'),
    App;

App = function (config) {
    var self = this;

    EventEmitter.call(this, {
        wildcard: true,
        delimiter: ':'
    });

    this.modules = [];
    this.title = config.title || 'Miner-Dashboard';

    (config.modules || []).forEach(function (moduleConfig) {
        var sha1sum,
            Module = _.isFunction(moduleConfig.module) ? moduleConfig.module : require('./modules/' + moduleConfig.module),
            module;

        if (!moduleConfig.id) {
            sha1sum = crypto.createHash('sha1');
            sha1sum.update(moduleConfig.module.toString());
            sha1sum.update(JSON.stringify(moduleConfig));
            moduleConfig.id = sha1sum.digest('hex');
        }

        module = new Module(self, moduleConfig);

        module.on('update:data', function (data) {
            self.updateData(moduleConfig.id, data);
        });

        module.on('update:view', function () {
            self.updateView(moduleConfig.id, module.view);
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

App.prototype.getViews = function () {
    return _(this.modules)
        .filter(function (module) {
            return module.id !== '__webinterface__';
        })
        .map(function (module) {
            return module.view;
        })
        .value();
};

module.exports = App;
