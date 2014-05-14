'use strict';

var number = require('../../../../../lib/handlebars/helpers/number');

describe('handlebars/helpers/number', function () {

    [
        { number: undefined, expected: '' },
        { number: NaN, expected: '' },
        { number: {}, expected: '' },
        { number: 'a string', expected: 'a string' },
        { number: Infinity, expected: '∞' },
        { number: -Infinity, expected: '-∞' },
        { number: 0, expected: '0' },
        { number: 10, expected: '10' },
        { number: 10.31, expected: '10.31' },
        { number: 10.312667, expected: '10.31267' },
        { number: 10.312667, precision: 3, expected: '10.313' },
        { number: 1000, expected: '1,000' },
        { number: 1000.132561, expected: '1,000.13256' },
        { number: 1000.132561, precision: 3, expected: '1,000.133' },
    ].forEach(function (testCase) {
        it('should return "' + testCase.expected + '" for "' + testCase.number + '"', function () {
            var options = { hash: {} };

            if (testCase.precision) {
                options.hash.precision = testCase.precision.toString();
            }

            expect(number(testCase.number, options)).to.equal(testCase.expected);
        });
    });

});