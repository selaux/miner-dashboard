'use strict';

var fs = require('fs'),
    path = require('path'),

    EventEmitter = require('eventemitter2').EventEmitter2,

    _ = require('lodash'),

    Handlebars = require('./handlebars/handlebars'),
    ServerModule;

ServerModule = function (app, config) {
    config = config || {};

    EventEmitter.call(this, {
        wildcard: true,
        delimiter: ':'
    });

    this.app = app;
    this.id = config.id;
    this.config = _.extend({}, this.defaults, _.omit(config, 'id'));
    this.template = this.getCompiledTemplate(this.template);
    this.noDataTemplate = this.getCompiledTemplate('noData');
    this.initialize();
    this.updateView();

    this.on('update:data', function () {
        this.updateView();
    });
};

_.extend(ServerModule.prototype, _.omit(EventEmitter.prototype, 'constructor'));

ServerModule.extend = function (extended) {
    var child = function () { return ServerModule.apply(this, arguments); };
    _.extend(child.prototype, _.omit(ServerModule.prototype, 'constructor'), extended);
    return child;
};

ServerModule.prototype.template = 'json';

ServerModule.prototype.initialize = function () {};

ServerModule.prototype.getCompiledTemplate = function (templateName) {
    return Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../templates/' + templateName + '.hbs')).toString());
};

ServerModule.prototype.updateData = function (data) {
    this.data = data;
    this.emit('update:data', data);
};

ServerModule.prototype.renderViewWithoutData = function () {
    return this.noDataTemplate({
        id: this.id,
        title: this.title
    });
};

ServerModule.prototype.getViewData = function () {
    return { json: JSON.stringify(this.data) };
};

ServerModule.prototype.renderView = function () {
    return this.template(_.extend({
        id: this.id,
        title: this.title,
        lastUpdated: new Date()
    }, this.data, this.getViewData()));
};

ServerModule.prototype.updateView = function () {
    this.view = this.data ? this.renderView() : this.renderViewWithoutData();
    this.emit('update:view', this.view);
};

module.exports = ServerModule;