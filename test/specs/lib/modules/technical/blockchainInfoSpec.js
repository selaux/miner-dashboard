'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),
    Bluebird = require('bluebird'),

    statsAnswer = {
        'n_blocks_total': 123,
        'minutes_between_blocks': 12,
        'n_tx': 10,
        'total_btc_sent': 1,
        difficulty: 100 * (1 / 4295032833),
        'hash_rate': 123
    },
    btcPerBlockAnswer = 2500000000;

chai.use(sinonChai);

describe('modules/technical/blockchainInfo', function () {
    var BlockchainInfo,
        app,
        requestStub;

    beforeEach(function () {
        requestStub = sinon.stub();
        requestStub.withArgs('https://blockchain.info/stats?format=json').returns(Bluebird.resolve(statsAnswer));
        requestStub.withArgs('https://blockchain.info/q/bcperblock').returns(Bluebird.resolve(btcPerBlockAnswer));

        BlockchainInfo = SandboxedModule.require('../../../../../lib/modules/technical/blockchainInfo', {
            requires: {
                '../../utils/request': requestStub
            }
        });
        app = { logger: { debug: sinon.stub(), info: sinon.stub() } };
    });

    it('should get data from blockchainInfo correctly', function (done) {
        var blockchainInfo;

        blockchainInfo = new BlockchainInfo(app);
        blockchainInfo.on('change', function () {
            setImmediate(function () {
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
                    JSON.stringify([ statsAnswer, btcPerBlockAnswer ])
                );

                done();
            });
        });
    });

    [
        'https://blockchain.info/stats?format=json',
        'https://blockchain.info/q/bcperblock'
    ].forEach(function (testCase) {
        it('should log the incident if the request to ' + testCase.failing + 'fails with an error', function (done) {
            var error = new Error('Test Error'),
                blockchainInfo;

            requestStub.withArgs(testCase).returns(Bluebird.reject(error));

            blockchainInfo = new BlockchainInfo(app);
            setTimeout(function () {
                expect(blockchainInfo.toJSON()).to.be.empty;
                expect(app.logger.info).to.have.been.calledOnce;
                expect(app.logger.info).to.have.been.calledWith('%s - error fetching data from blockchain.info', blockchainInfo.id, error.toString());
                done();
            }, 10);
        });
    });

    it('should have the title set correctly', function () {
        var blockchainInfo = new BlockchainInfo(app);

        expect(blockchainInfo.title).to.equal('Blockchain.info');
    });

});