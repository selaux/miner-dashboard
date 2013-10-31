'use strict';

var expect = require('chai').expect;

module.exports = function (responses) {
    return function(options, callback) {
        var response = responses[options.uri],
            triggerResponse = function (err, response) {
                setTimeout(function () {
                    callback(err, response);
                }, 20);
            };

        expect(options.json).to.be.true;
        if (response) {
            triggerResponse(null, response);
        } else {
            triggerResponse(new Error('Test Error'));
        }
    };
};