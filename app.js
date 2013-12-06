#!/usr/bin/env node

'use strict';

var path = require('path'),
    _ = require('lodash'),
    opts = require('nomnom'),
    config,
    webinterface = require('./frontend/webinterface'),
    webinterfaceDefaults = {
        id: '__webinterface__',
        module: webinterface,
        port: 3000
    },
    App = require('./lib/App');


opts = opts.option('config', {
    abbr: 'c',
    'default': './config/config.js',
    help: 'Path to config file'
}).parse();

config = require(path.resolve(opts.config));
config.modules.push(_.extend(webinterfaceDefaults, config.webinterface));

module.exports = new App(config);
