'use strict';

module.exports = function (webinterface) {
    webinterface.get('/', function(req, res) {
        var app = webinterface.get('app');

        res.render('index', {
            title: app.title,
            allViews: app.getViews().join('')
        });
    });
};

