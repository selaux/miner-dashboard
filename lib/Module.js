'use strict';

var _ = require('lodash'),
    Backbone = require('backbone'),

    Module;

Module = Backbone.Model.extend({
    constructor: function (app, config) {
        config = config || {};

        this.app = app;
        this.attributes = {};
        this.id = config.id;
        this.config = _.extend({}, this.defaults, _.omit(config, 'id'));
        if (this.config.title) {
            this.title = this.config.title;
        }
        if (this.config.viewId) {
            this.viewId = this.config.viewId;
        }
        this.initialize();
    },

    set: function () {
        this.lastUpdated = new Date().getTime();
        Backbone.Model.prototype.set.apply(this, arguments);
    }
});

module.exports = Module;