'use strict';

var EventEmitter = require('eventemitter2').EventEmitter2,
    crypto = require('crypto'),
    _ = require('lodash'),
    Logger = require('./Logger'),
    App;

App = function (config) {
    var self = this;

    EventEmitter.call(this, {
        wildcard: true,
        delimiter: ':'
    });

    this.modules = [];
    this.views = [];
    this.title = config.title || 'Miner-Dashboard';
    this.logger = new Logger(config.logs);

    (config.modules || []).forEach(function (moduleConfig) {
        var sha1sum,
            Module = _.isFunction(moduleConfig.module) ? moduleConfig.module : require('./modules/' + moduleConfig.module),
            View = Module.prototype.viewId ? require('./views/' + Module.prototype.viewId) : undefined,
            module;

        if (!moduleConfig.id) {
            sha1sum = crypto.createHash('sha1');
            sha1sum.update(moduleConfig.module.toString());
            sha1sum.update(JSON.stringify(moduleConfig));
            moduleConfig.id = sha1sum.digest('hex');
        }

        module = new Module(self, moduleConfig);
        if (View) {
            self.views.push(new View(module));
        }

        module.on('change', function () {
            self.updateData(moduleConfig.id, module.toJSON());
        });

        self.modules.push(module);
    });
};

_.extend(App.prototype, _.omit(EventEmitter.prototype, 'constructor'));

App.prototype.updateData = function (moduleId, data) {
    this.emit('update:data:' + moduleId, data);
};

module.exports = App;
