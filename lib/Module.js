'use strict';

var fs = require('fs'),
    path = require('path'),

    EventEmitter = require('eventemitter2').EventEmitter2,

    _ = require('lodash'),

    Handlebars = require('./handlebars/handlebars'),
    noDataTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../templates/noData.hbs')).toString()),
    Module;

Module = function (app, config) {
    config = config || {};

    EventEmitter.call(this, {
        wildcard: true,
        delimiter: ':'
    });

    this.app = app;
    this.id = config.id;
    this.config = _.extend({}, this.defaults, _.omit(config, 'id'));
    this.template = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../templates/' + this.template + '.hbs')).toString());
    this.initialize();
    this.updateView();

    this.on('update:data', function () {
        this.updateView();
    });
};

_.extend(Module.prototype, _.omit(EventEmitter.prototype, 'constructor'));

Module.extend = function (extended) {
    var child = function () { return Module.apply(this, arguments); };
    _.extend(child.prototype, _.omit(Module.prototype, 'constructor'), extended);
    return child;
};

Module.prototype.template = 'json';

Module.prototype.initialize = function () {};

Module.prototype.updateData = function (data) {
    this.data = data;
    this.emit('update:data', data);
};

Module.prototype.renderViewWithoutData = function () {
    return noDataTemplate({
        id: this.id,
        title: this.title
    });
};

Module.prototype.getViewData = function () {
    return { json: JSON.stringify(this.data) };
};

Module.prototype.renderView = function () {
    return this.template(_.extend({
        id: this.id,
        title: this.title,
        lastUpdated: new Date()
    }, this.data, this.getViewData()));
};

Module.prototype.updateView = function () {
    this.view = this.data ? this.renderView() : this.renderViewWithoutData();
    this.emit('update:view', this.view);
};

module.exports = Module;