'use strict';

var moment = require('moment'),
    chai = require('chai'),
    expect = chai.expect,

    time = require('../../../../../lib/handlebars/helpers/time');

describe('handlebars/helpers/time', function () {

    [
        { time: undefined, expected: '' },
        { time: {}, expected: '' },
        { time: 'a string', expected: 'a string' },
        { time: moment('2013-02-08 09:30').toDate(), expected: '2013-02-08, 09:30:00' },
        { time: moment('2013-02-08 20:30:11').toDate(), expected: '2013-02-08, 20:30:11' }
    ].forEach(function (testCase) {
        it('should return "' + testCase.expected + '" for "' + testCase.time + '"', function () {
            expect(time(testCase.time)).to.equal(testCase.expected);
        });
    });

});