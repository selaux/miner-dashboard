'use strict';

var _ = require('lodash');

module.exports = function (webinterface) {
    webinterface.get('/', function(req, res) {
        var app = webinterface.get('app'),
            viewableModules = app.modules.filter(function (module) {
                return module.viewId;
            }),
            config = viewableModules.map(function (module) {
                    return _.extend({ id: module.id, viewId: module.viewId, title: module.title }, module.config);
                }),
            ids = viewableModules.map(function (module) {
                return module.id;
            }),
            data = viewableModules.map(function (module) {
                    return module.attributes;
                }),
            dataMap = _.object(ids, data);

        res.render('index', {
            title: app.title,
            modules: JSON.stringify(config),
            dataMap: JSON.stringify(dataMap),
            allViews: _.map(app.views, function (view) { return view.getFullHtml(); }).join('')
        });
    });
};

