'use strict';

var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    extendMixin = require('./extend'),
    EventEmitter = require('eventemitter2').EventEmitter2,

    Handlebars = require('./handlebars/handlebars'),
    View;

View = function (module) {
    EventEmitter.call(this, {
        wildcard: true,
        delimiter: ':'
    });

    this.module = module;
    if (this.template) {
        this.template = this.getCompiledTemplate(this.template);
        this.noDataTemplate = this.getCompiledTemplate('noData');
    }
};

_.extend(View.prototype, _.omit(EventEmitter.prototype, 'constructor'));
extendMixin(View);

View.prototype.getCompiledTemplate = function (templateName) {
    return Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../templates/' + templateName + '.hbs')).toString());
};

View.prototype.render = function () {
    return this.module.data ? this.renderViewWithData() : this.renderViewWithoutData();
};

View.prototype.getViewData = function () {
    return { json: JSON.stringify(this.module.data) };
};

View.prototype.renderViewWithData = function () {
    return this.template(_.extend({
        id: this.module.id,
        title: this.module.title,
        lastUpdated: new Date()
    }, this.module.data, this.getViewData()));
};

View.prototype.renderViewWithoutData = function () {
    return this.noDataTemplate({
        id: this.module.id,
        title: this.module.title
    });
};

module.exports = View;
