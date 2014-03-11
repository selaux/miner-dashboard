'use strict';

var _ = require('lodash'),
    $ = require(typeof window !== 'undefined' ? 'jquery' : 'cheerio'),
    Backbone = require('backbone'),

    Handlebars = require('./handlebars/handlebars'),
    templateCache = require('../build/compiledTemplates')(Handlebars),
    View;

Backbone.$ = $;

View = Backbone.View.extend({
    tagName: 'section',

    constructor: function (module, options) {
        this.module = module;
        if (this.template) {
            this.compiledTemplate = this.getCompiledTemplate(this.template);
            this.noDataTemplate = this.getCompiledTemplate('noData');
        }

        Backbone.View.prototype.constructor.call(this, options);
    },

    className: function () {
        var classNames = [ 'panel' ];

        if (_.isEmpty(this.module.attributes)) {
            classNames.push('panel-warning');
            classNames.push('noData');
        } else {
            if (this.module.has('connected')) {
                classNames.push(this.module.get('connected') ? 'panel-success' : 'panel-danger');
            } else {
                classNames.push('panel-success');
            }
            classNames.push(this.module.viewId);
        }

        return classNames.join(' ');
    },

    attributes: function () {
        return {
            id: this.module.id
        };
    },

    getCompiledTemplate: function (templateName) {
        return templateCache[templateName];
    },

    render: function () {
        this.updateHtml();
    },

    updateHtml: function () {
        var attrs = _.extend({}, _.result(this, 'attributes'), { 'class': _.result(this, 'className') }),
            html = !_.isEmpty(this.module.attributes) ? this.renderViewWithData() : this.renderViewWithoutData();
        this.$el.attr(attrs).html(html);
    },

    getFullHtml: function () {
        this.updateHtml();
        return $('<div />').append(this.$el).html();
    },

    getViewData: function () {
        return { json: JSON.stringify(this.module.attributes) };
    },

    renderViewWithData: function () {
        return this.compiledTemplate(_.extend({
            id: this.module.id,
            title: this.module.title,
            lastUpdated: new Date().getTime()
        }, this.module.attributes, this.getViewData()));
    },

    renderViewWithoutData: function () {
        return this.noDataTemplate({
            id: this.module.id,
            title: this.module.title
        });
    }
});

module.exports = View;
