'use strict';

var fs = require('fs'),
    path = require('path'),

    Handlebars = require('handlebars'),
    _ = require('lodash'),
    request = require('request'),

    Module =require('../../Module'),

    technicalTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../../../templates/technical.hbs')).toString());

module.exports = Module.extend({

    defaults: {
        interval: 6 * 60 * 60 * 1e3
    },

    initialize: function () {
        var self = this;

        self.title = 'Blockchain.info';

        setInterval(function () { self.updateTechnicalStats(); }, self.config.interval);
        self.updateTechnicalStats();
    },

    updateTechnicalStats: function () {
        var self = this,
            data = {},
            callbacks = 0,
            finished = function () {
                callbacks = callbacks + 1;
                if (callbacks === 3) {
                    self.updateData(data);
                }
            };

        request({
            uri:  'http://blockchain.info/de/stats?format=json',
            json: true
        }, function (err, res) {
            _.extend(data, res.body);
            finished();
        });

        request({
            uri:  'http://blockexplorer.com/q/bcperblock',
            json: true
        }, function (err, res) {
            data.btcPerBlock = res.body;
            finished();
        });

        request({
            uri:  'http://blockchain.info/de/q/probability',
            json: true
        }, function (err, res) {
            data.probability = res.body;
            finished();
        });
    },

    renderView: function () {
        return technicalTemplate(_.extend({
            id: this.id,
            title: this.title
        }, this.data));
    }

});