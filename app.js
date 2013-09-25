'use strict';

var express = require('express'),
    exphbs  = require('express3-handlebars'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    config = require('./config/config.json'),
    server,
    io,
    Adapter = require('./adapters/' + config.adapter),
    adapter = new Adapter();
    
config.middlewares.forEach(function (mw) {
    adapter.use(require('./middleware/' + mw));
});

// TODO: Logging

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.engine('hbs', exphbs({
        defaultLayout: 'main',
        extname: '.hbs'
    }));
    app.set('view engine', 'hbs');
    app.set('adapter', adapter);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

routes(app);

server = http.createServer(app).listen(app.get('port'), function(){
    io = require('socket.io').listen(server, { log: false });
    adapter.on('statusUpdate', function (data) {
        io.sockets.emit('statusUpdate', data);
    });
    console.log('Express and Websocket server listening on port ' + app.get('port'));
});
