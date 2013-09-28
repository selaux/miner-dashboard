'use strict';

var chai = require('chai'),
    expect = chai.expect,

    cgminer = require('../../../../lib/adapters/cgminer'),
    bfgminer = require('../../../../lib/adapters/bfgminer');

describe('adapters/cgminer', function () {

    it('should use the bfgminer adapter', function () {
        expect(cgminer).to.equal(bfgminer);
    });

});