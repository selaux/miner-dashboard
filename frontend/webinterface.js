'use strict';

var express = require('express'),
    exphbs  = require('express3-handlebars'),
    routes = require('./frontend/routes'),
    http = require('http'),
    path = require('path'),
    server,
    io;

// TODO: Logging
module.exports = function (app, config) {
    var webinterface = express();

    webinterface.configure(function(){
        webinterface.set('port', config.port);
        webinterface.set('views', __dirname + '/frontend/views');
        webinterface.engine('hbs', exphbs({
            layoutsDir: 'frontend/views/layouts/',
            partialsDir: 'frontend/views/partials/',
            defaultLayout: 'main',
            extname: '.hbs'
        }));
        webinterface.set('view engine', 'hbs');
        webinterface.set('config', config);
        webinterface.use(express.favicon('frontend/public/images/favicon.ico'));
        webinterface.use(express.logger('dev'));
        webinterface.use(express.bodyParser());
        webinterface.use(express.methodOverride());
        webinterface.use(webinterface.router);

        webinterface.use(require('stylus').middleware(__dirname + '/public'));
        webinterface.use(express.static(path.join(__dirname, '/public')));
    });

    webinterface.configure('development', function(){
        webinterface.use(express.errorHandler());
    });

    routes(webinterface);

    server = http.createServer(webinterface).listen(webinterface.get('port'), function(){
        io = require('socket.io').listen(server, { log: false });
        console.log('Express and Websocket server listening on port ' + webinterface.get('port'));
    });
};
