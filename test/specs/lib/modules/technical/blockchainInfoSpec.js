'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),

    responses = {},
    statsAnswer = {
        'n_blocks_total': 123,
        'minutes_between_blocks': 12,
        'n_tx': 10,
        'total_btc_sent': 1,
        difficulty: 100 * (1 / 4295032833),
        'hash_rate': 123
    },
    btcPerBlockAnswer = 2500000000,
    BlockchainInfo = SandboxedModule.require('../../../../../lib/modules/technical/blockchainInfo', {
        requires: {
            request: require('../../../../utils/requestStub')(responses)
        }
    });

chai.use(sinonChai);

describe('modules/technical/blockchainInfo', function () {
    var app;

    beforeEach(function () {
        app = { logger: { debug: sinon.stub(), info: sinon.stub() } };
        responses['http://blockchain.info/stats?format=json'] = {
            statusCode: 200,
            body: statsAnswer
        };
        responses['http://blockchain.info/q/bcperblock'] = {
            statusCode: 200,
            body: btcPerBlockAnswer
        };
    });

    it('should get data from blockchainInfo correctly', function (done) {
        var blockchainInfo = new BlockchainInfo(app);

        blockchainInfo.on('change', function () {
            expect(blockchainInfo.toJSON()).to.deep.equal({
                blockReward: 25,
                probability: 0.01,
                difficulty: 100 * (1 / 4295032833),
                networkHashrate: 123000,
                blockChainLength: 123,
                timeBetweenBlocks: 12,
                numberOfTransactions: 10,
                totalTransactionValue: 1
            });
            expect(app.logger.debug).to.have.been.calledOnce;
            expect(app.logger.debug).to.have.been.calledWith(
                '%s - fetched data from blockchain.info',
                blockchainInfo.id,
                JSON.stringify([ 200, 200 ]),
                JSON.stringify([ statsAnswer, btcPerBlockAnswer ])
            );
            done();
        });
    });

    [
        'http://blockchain.info/stats?format=json',
        'http://blockchain.info/q/bcperblock'
    ].forEach(function (url) {
        it('should not throw an error if the request to ' + url + 'fails with an error and log the incident', function (done) {
            var blockchainInfo;

            responses[url] = null;

            blockchainInfo = new BlockchainInfo(app);

            setTimeout(function () {
                expect(blockchainInfo.toJSON()).to.be.empty;
                expect(app.logger.info).to.have.been.calledOnce;
                expect(app.logger.info).to.have.been.calledWith('%s - error fetching data from blockchain.info', blockchainInfo.id, new Error('Test Error'));
                done();
            }, 50);
        });

        it('should not throw an error if the request to ' + url + 'returns a non 200 http status code and no data', function (done) {
            var blockchainInfo;

            responses[url] = {
                statusCode: 500,
                body: 'Internal Server Error'
            };

            blockchainInfo = new BlockchainInfo(app);

            setTimeout(function () {
                expect(blockchainInfo.toJSON()).to.be.empty;
                done();
            }, 50);
        });

    });

    it('should have the title set correctly', function () {
        var blockchainInfo = new BlockchainInfo(app);

        expect(blockchainInfo.title).to.equal('Blockchain.info');
    });

});