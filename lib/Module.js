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
        this.title = this.config.title;
        this.initialize();
    }
});

module.exports = Module;