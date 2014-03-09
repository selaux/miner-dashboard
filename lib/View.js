'use strict';

var fs = require('fs'),
    path = require('path'),

    _ = require('lodash'),
    extendMixin = require('./extend'),

    Handlebars = require('./handlebars/handlebars'),
    View;

View = function (module) {
    this.module = module;
    if (this.template) {
        this.template = this.getCompiledTemplate(this.template);
        this.noDataTemplate = this.getCompiledTemplate('noData');
    }
};
extendMixin(View);

View.prototype.getCompiledTemplate = function (templateName) {
    return Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../templates/' + templateName + '.hbs')).toString());
};

View.prototype.render = function () {
    return !_.isEmpty(this.module.attributes) ? this.renderViewWithData() : this.renderViewWithoutData();
};

View.prototype.getViewData = function () {
    return { json: JSON.stringify(this.module.attributes) };
};

View.prototype.renderViewWithData = function () {
    return this.template(_.extend({
        id: this.module.id,
        title: this.module.title,
        lastUpdated: new Date()
    }, this.module.attributes, this.getViewData()));
};

View.prototype.renderViewWithoutData = function () {
    return this.noDataTemplate({
        id: this.module.id,
        title: this.module.title
    });
};

module.exports = View;
