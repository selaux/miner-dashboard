'use strict';

var express = require('express'),
    exphbs  = require('express3-handlebars'),
    stylus = require('stylus'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),

    Module = require('../lib/Module');

// TODO: Logging
module.exports = Module.extend({

    defaults: {
        port: 3000
    },

    template: null,

    initialize: function () {
        var self = this,
            webinterface = express();

        webinterface.configure(function () {
            webinterface.set('port', self.config.port);

            webinterface.set('views', path.join(__dirname, '/views'));
            webinterface.engine('hbs', exphbs({
                layoutsDir: path.join(__dirname, '/views/layouts/'),
                partialsDir: path.join(__dirname, '/views/partials/'),
                defaultLayout: 'main',
                extname: '.hbs'
            }));
            webinterface.set('view engine', 'hbs');

            webinterface.set('config', self.config);
            webinterface.set('app', self.app);

            webinterface.use(express.favicon(path.join(__dirname, '../build/public/images/favicon.ico')));
            webinterface.use(express.logger('dev'));
            webinterface.use(express.bodyParser());
            webinterface.use(express.methodOverride());
            webinterface.use(webinterface.router);

            webinterface.use(stylus.middleware({
                src: __dirname,
                dest: path.join(__dirname, '../build/public'),
                compile: function (str, path) {
                    return stylus(str)
                        .set('filename', path)
                        .set('include css', true);
                }
            }));
            webinterface.use(express.static(path.join(__dirname, '../build/public')));
        });

        webinterface.configure('development', function(){
            webinterface.use(express.errorHandler());
        });

        routes(webinterface);

        self.server = http.createServer(webinterface).listen(webinterface.get('port'), function(){
            self.io = require('socket.io').listen(self.server, { log: false });
            console.log('Express and Websocket server listening on port ' + webinterface.get('port'));

            self.app.modules.forEach(function (module) {
                module.on('change', function (data) {
                    self.io.sockets.emit('update:data', module.id, data);
                });
            });
        });
    }

});
