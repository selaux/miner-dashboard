'use strict';

var chai = require('chai'),
    expect = chai.expect,

    cgminer = require('../../../adapters/cgminer'),
    bfgminer = require('../../../adapters/bfgminer');

describe('adapters/cgminer', function () {

    it('should use the bfgminer adapter', function () {
        expect(cgminer).to.equal(bfgminer);
    });

});