'use strict';

var _ = require('lodash');

module.exports = function (webinterface) {
    webinterface.get('/', function(req, res) {
        var app = webinterface.get('app');

        res.render('index', {
            title: app.title,
            allViews: _.map(app.views, function (view) { return view.render(); }).join('')
        });
    });
};

