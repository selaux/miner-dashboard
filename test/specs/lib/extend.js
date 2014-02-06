'use strict';

var chai = require('chai'),
    expect = chai.expect,
    _ = require('lodash'),

    extendMixin = require('../../../lib/extend');

describe('extend', function () {
    it('should return a constructor that extends the Module', function () {
        var Constructor = function () {},
            extendedThing;

        extendMixin(Constructor);
        extendedThing = Constructor.extend({ some: 'new property' });
        expect(_.omit(extendedThing.prototype, 'some', 'constructor')).to.deep.equal(Constructor.prototype);
        expect(extendedThing.prototype.some).equal('new property');
    });
});

