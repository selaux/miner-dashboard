'use strict';

var SandboxedModule = require('sandboxed-module'),
    Bluebird = require('bluebird'),
    coinchooseResponse = [
        {
            symbol:'ALF',
            name:'Alphacoin',
            algo:'scrypt',
            currentBlocks:'561272',
            difficulty:'2',
            reward:'50',
            minBlockTime:'0.5',
            networkhashrate:'106463482'
        },
        {
            symbol:'BTC',
            name:'Bitcoin',
            algo:'SHA-256',
            currentBlocks:'12345',
            difficulty:'1.5',
            reward:'25',
            minBlockTime:'10',
            networkhashrate:'100000000000'
        }
    ];

describe('modules/technical/coinchooseCom', function () {
    var requestStub,
        Coinchoose,
        app;

    beforeEach(function () {
        requestStub = sinon.stub(),
        Coinchoose = SandboxedModule.require('../../../../../lib/modules/technical/coinchooseCom', {
            requires: {
                '../../utils/request': requestStub
            }
        });
        app = { logger: { debug: sinon.stub(), info: sinon.stub() } };
    });

    it('should get data from coinchoose correctly', function (done) {
        var coinchoose;

        requestStub.withArgs('http://www.coinchoose.com/api.php?base=BTC').returns(Bluebird.resolve(coinchooseResponse));

        coinchoose = new Coinchoose(app, { coin: 'ALF' });
        coinchoose.on('change', function () {
            setImmediate(function () {
                expect(app.logger.debug).to.have.been.calledOnce;
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched data from coinchoose.com',
                    coinchoose.id,
                    JSON.stringify(coinchooseResponse)
                );

                expect(coinchoose.toJSON()).to.deep.equal({
                    coin: 'ALF',
                    algorithm: 'scrypt',
                    blockReward: 50,
                    probability: 1 / (4295032833 * 2),
                    difficulty: 2,
                    networkHashrate: 106.463482,
                    blockChainLength: 561272,
                    timeBetweenBlocks: 0.5
                });

                done();
            });
        });
    });

    it('should log if the coin could not be found', function (done) {
        var coinchoose;

        requestStub.withArgs('http://www.coinchoose.com/api.php?base=BTC').returns(Bluebird.resolve(coinchooseResponse));

        coinchoose = new Coinchoose(app, { coin: 'PPC' });
        setTimeout(function () {
            expect(coinchoose.toJSON()).to.be.empty;
            expect(app.logger.info).to.have.been.calledOnce;
            expect(app.logger.info).to.have.been.calledWith('%s - error fetching data from coinchoose.com', coinchoose.id, 'Coin PPC not found');
            done();
        }, 10);
    });

    it('should log if the request errors', function (done) {
        var err = new Error('Test Error'),
            coinchoose;

        requestStub.withArgs('http://www.coinchoose.com/api.php?base=BTC').returns(Bluebird.reject(err));

        coinchoose = new Coinchoose(app);
        setTimeout(function () {
            expect(coinchoose.toJSON()).to.be.empty;
            expect(app.logger.info).to.have.been.calledOnce;
            expect(app.logger.info).to.have.been.calledWith('%s - error fetching data from coinchoose.com', coinchoose.id, err.toString());
            done();
        }, 10);
    });

    it('should have the title set correctly', function () {
        var coinchoose;

        requestStub.withArgs('http://www.coinchoose.com/api.php?base=BTC').returns(Bluebird.resolve(coinchooseResponse));

        coinchoose = new Coinchoose(app);
        expect(coinchoose.title).to.equal('Coinchoose.com - BTC');
    });
});