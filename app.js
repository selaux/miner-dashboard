'use strict';

var _ = require('lodash'),
    config = require('./config/config.js'),
    webinterface = require('./frontend/webinterface'),
    webinterfaceDefaults = {
        module: webinterface,
        port: 3000
    },
    App = require('./lib/App');

config.modules.push(_.extend(webinterfaceDefaults, config.webinterface));

module.exports = new App(config);
