/*jshint -W097 */

'use strict';

var $ = require('jquery'),
    _ = require('lodash'),
    io = require('socket.io-client'),
    Module = require('../../lib/Module'),
    modules = window.config,
    dataMap = window.dataMap;

function initializeApp() {
    var socket = io.connect('http://' + window.location.host, {
        'reconnect': true,
        'reconnection delay': 5000,
        'max reconnection attempts': Infinity
    });

    modules = modules.map(function (config) {
        var $el = $('section[id="' + config.id + '"]'),
            module = new Module(null, config),
            View = require('lib/views/' + config.viewId),
            view = new View(module, { el: $el });

        module.set(dataMap[config.id]);
        module.on('change', view.render, view);
        view.postRender();

        return module;
    });

    socket.on('update:data', function (id, data) {
        var module = _.find(modules, function (module) { return module.id === id; });
        if (module) {
            module.set(data);
        }
    });

    socket.on('connect', function () {
        document.getElementById('backend-connection').innerHTML = '';
    });

    socket.on('disconnect', function () {
        document.getElementById('backend-connection').innerHTML = '<div class="alert alert-danger row"><strong>Error:</strong> Backend Disconnected</div>';
    });
}

$(initializeApp);