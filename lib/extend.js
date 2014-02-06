'use strict';

var _ = require('lodash');

module.exports = function (Thing) {
    Thing.extend = function (extended) {
        var child = function () { return Thing.apply(this, arguments); };
        _.extend(child.prototype, _.omit(Thing.prototype, 'constructor'), extended);
        return child;
    };
};
