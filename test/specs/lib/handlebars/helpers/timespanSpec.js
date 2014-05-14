'use strict';

var timespan = require('../../../../../lib/handlebars/helpers/timespan');

describe('handlebars/helpers/number', function () {

    [
        { timespan: undefined, expected: '' },
        { timespan: NaN, expected: '' },
        { timespan: {}, expected: '' },
        { timespan: 'a string', expected: 'a string' },
        { timespan: 0, expected: '0s' },
        { timespan: 10, expected: '10s' },
        { timespan: 60, expected: '1m0s' },
        { timespan: 130, expected: '2m10s' },
        { timespan: 7270, expected: '2h1m10s' },
        { timespan: 262870, expected: '3d1h1m10s' }
    ].forEach(function (testCase) {
            it('should return "' + testCase.expected + '" for "' + testCase.timespan + '"', function () {
                expect(timespan(testCase.timespan)).to.equal(testCase.expected);
            });
        });

});