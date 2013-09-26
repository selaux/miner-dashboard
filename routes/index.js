'use strict';

var collectData = require('../utils/collectData');

module.exports = function (app) {
    app.get('/', exports.index = function(req, res) {
        res.render('index', collectData(app));
    });
};

