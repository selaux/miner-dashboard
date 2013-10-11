'use strict';

var EventEmitter = require('events').EventEmitter,

    _ = require('lodash'),

    Module;

Module = function (app, config) {
    config = config || {};

    this.app = app;
    this.id = config.id;
    this.config = _.extend({}, this.defaults, _.omit(config, 'id'));
    this.initialize();
};

_.extend(Module.prototype, _.omit(EventEmitter.prototype, 'constructor'));

Module.extend = function (extended) {
    var child = function () { return Module.apply(this, arguments); };
    _.extend(child.prototype, _.omit(Module.prototype, 'constructor'), extended);
    return child;
};

Module.prototype.initialize = function () {};

Module.prototype.updateData = function (data) {
    this.data = data;
    this.emit('update:data', data);
};

Module.prototype.updateView = function (view) {
    this.view = view;
    this.emit('update:view', view);
};

module.exports = Module;