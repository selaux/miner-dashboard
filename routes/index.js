'use strict';

module.exports = function (app) {
    app.get('/', exports.index = function(req, res) {
        var data = {
                miner: { connected: false }
            },
            adapter = app.get('adapter');
        if (adapter && adapter.data) {
            data = adapter.data;
        }
        res.render('index', data);
    });
};

