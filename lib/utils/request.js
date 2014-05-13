'use strict';

var nodeUrl = require('url'),
    http = require('http'),
    https = require('https'),
    _ = require('lodash'),
    Bluebird = require('bluebird');

module.exports = function (url, options) {
    var requestMethod;

    url = nodeUrl.parse(url);
    options = _.defaults(options || {}, {
        host: url.host,
        port: url.port,
        method: 'GET',
        path: url.path
    });
    requestMethod = url.protocol === 'http:' ? http.request : https.request;

    return new Bluebird(function (resolve, reject) {
        var req = requestMethod(options, function (res) {
            var body = '';

            if (res.statusCode !== 200) {
                reject(new Error(nodeUrl.format(url) + ' returned status code ' + res.statusCode));
            }

            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', function (e) {
            reject(e);
        });
        req.end();
    });
};