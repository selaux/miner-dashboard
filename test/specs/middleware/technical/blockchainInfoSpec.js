'use strict';

var _ = require('lodash'),
    chai = require('chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),

    statsAnswer = {
        some: 'stats'
    },
    btcPerBlockAnswer = 25,
    probabilityAnswer = 0.01,
    blockchainInfo = SandboxedModule.require('../../../../middleware/technical/blockchainInfo', {
        requires: {
            'request': function (options, callback) {
                var response;

                expect(options.json).to.be.true;
                switch (options.uri) {
                case 'http://blockchain.info/de/stats?format=json':
                    response = statsAnswer;
                    break;
                case 'http://blockexplorer.com/q/bcperblock':
                    response = btcPerBlockAnswer;
                    break;
                case 'http://blockchain.info/de/q/probability':
                    response = probabilityAnswer;
                    break;
                default:
                    throw new Error('Unmatched uri: ' + options.uri);
                }

                callback(null, {
                    body: response
                });
            }
        }
    });

describe('middleware/technical/blockchainInfo', function () {

    it('should get data from blockchainInfo correctly', function () {
        var data = {};
        blockchainInfo(data, function (err) {
            expect(err).not.to.be.ok;
            expect(data.technical).to.deep.equal(_.extend({}, statsAnswer, {
                btcPerBlock: btcPerBlockAnswer,
                probability: probabilityAnswer
            }));
        });
    });

});