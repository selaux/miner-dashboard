'use strict';

var express = require('express'),
    favicon = require('serve-favicon'),
    compression = require('compression'),
    errorHandler = require('errorhandler'),
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

        webinterface.use(function (req, res, next) {
            next();
            self.app.logger.info('%s - %s %s HTTP/%s', req.ip, req.method, req.path, req.httpVersion);
        });

        webinterface.use(favicon(path.join(__dirname, '../build/public/images/favicon.ico')));
        webinterface.use(compression());
        webinterface.use(errorHandler());

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

        routes(webinterface);

        self.server = http.createServer(webinterface).listen(webinterface.get('port'), function(){
            self.io = require('socket.io').listen(self.server, { log: false });
            self.app.logger.info('server listening on port ' + webinterface.get('port'));

            self.app.modules.forEach(function (module) {
                module.on('change', function (data) {
                    self.io.sockets.emit('update:data', module.id, data);
                });
            });
        });
    }

});
