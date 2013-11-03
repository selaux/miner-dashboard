'use strict';

var chai = require('chai'),
    expect = chai.expect,

    hashrate = require('../../../../../lib/handlebars/helpers/hashrate');

describe('handlebars/helpers/hashrate', function () {

    [
        { input: undefined, expected: '' },
        { input: 'a string', expected: 'a string' },
        { input: 0, expected: '0.00 MH/s' },
        { input: 100, expected: '100.00 MH/s' },
        { input: 1024, expected: '1024.00 MH/s' },
        { input: 1933.30e3, expected: '1933.30 GH/s' },
        { input: 255.136e6, expected: '255.14 TH/s' },
        { input: 18.1e9, expected: '18.10 PH/s' },
        { input: 97.5e12, expected: '97.50 EH/s' },
    ].forEach(function (testCase) {
        it('should return "' + testCase.expected + '" for "' + testCase.input + '"', function () {
            expect(hashrate(testCase.input)).to.equal(testCase.expected);
        });
    });

});