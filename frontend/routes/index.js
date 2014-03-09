'use strict';

var _ = require('lodash');

module.exports = function (webinterface) {
    webinterface.get('/', function(req, res) {
        var app = webinterface.get('app'),
            config = _(app.modules).filter(function (module) {
                    return module.viewId;
                }).map(function (module) {
                    return _.extend({ id: module.id, viewId: module.viewId, title: module.title }, module.config);
                }).value();

        res.render('index', {
            title: app.title,
            modules: JSON.stringify(config),
            allViews: _.map(app.views, function (view) { return view.getFullHtml(); }).join('')
        });
    });
};

