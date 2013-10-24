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
    BlockchainInfo = SandboxedModule.require('../../../../../lib/modules/technical/blockchainInfo', {
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

                setTimeout(function () {
                    callback(null, {
                        body: response
                    });
                }, 20);
            }
        }
    });

describe('modules/technical/blockchainInfo', function () {

    it('should get data from blockchainInfo correctly', function (done) {
        var app = {},
            blockchainInfo = new BlockchainInfo(app);

        blockchainInfo.on('update:data', function (data) {
            expect(data).to.deep.equal(_.extend({}, statsAnswer, {
                btcPerBlock: btcPerBlockAnswer,
                probability: probabilityAnswer
            }));
            done();
        });
    });

    it('should have the title set correctly', function () {
        var app = {},
            blockchainInfo = new BlockchainInfo(app);

        expect(blockchainInfo.title).to.equal('Blockchain.info');
    });

});