'use strict';

var EventEmitter = require('events').EventEmitter,
    chai = require('chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),

    netEmitter = new EventEmitter(),
    minerResponse = JSON.stringify({
        STATUS: [
            {
                Code: 1,
                Description: 'test miner 0.1',
                Msg: 'Summary',
                STATUS: 'S',
                When: 1380114541
            }
        ],
        SUMMARY: [
            {
                'Accepted': 0,
                'Alogrithm': 'fastauto',
                'Best Share': 1,
                'Difficulty Accepted': 2.0,
                'Difficulty Rejected': 3.0,
                'Difficulty Stale': 4.0,
                'Discarded': 5,
                'Elapsed': 6,
                'Found Blocks': 7,
                'Get Failures': 8,
                'Getworks': 9,
                'Hardware Errors': 10,
                'Local Work': 11,
                'MHS av': 12.000,
                'Network Blocks': 13,
                'Rejected': 14,
                'Remote Failures': 15,
                'Stale': 16,
                'Total MH': 17,
                'Utility': 18,
                'Work Utility': 19
            }
        ]
    }) + '\x00',
    expectedStatusUpdate = {
        miner: {
            connected: true,
            description: 'test miner 0.1',
            avgHashrate: 12.000,
            hardwareErrors: 10,
            shares: {
                accepted: 0,
                rejected: 14,
                best: 1,
                stale: 16,
                discarded: 5
            },
            difficulty: {
                accepted: 2.0,
                rejected: 3.0,
                stale: 4.0,
            }
        }
    },

    BfgAdapter = SandboxedModule.require('../../../adapters/bfgminer', {
        requires: {
            '../config/config.json': {
                bfgminer: {
                    host: 'some.host',
                    port: 1111,
                    interval: 100
                }
            },
            'net': {
                connect: function (options, callback) {
                    netEmitter.removeAllListeners();
                    netEmitter.on('stub:write', function (data) {
                        expect(data.command).to.equal('summary');
                        setTimeout(function () {
                            netEmitter.emit('data', minerResponse);
                            netEmitter.emit('end');
                        }, 20);
                    });
                    setTimeout(callback, 10);
                    return netEmitter;
                }
            }
        }
    });

netEmitter.write = function (data) {
    this.emit('stub:write', JSON.parse(data));
};

describe('adapters/bfgminer', function () {
    afterEach(function () {
        netEmitter.removeAllListeners();
    });

    it('should request the status from a miner on instantiation', function (done) {
        var bfgAdapter = new BfgAdapter();
        bfgAdapter.on('statusUpdate', function (data) {
            expect(data).to.deep.equal(expectedStatusUpdate);
            bfgAdapter.removeAllListeners();
            done();
        });
    });

    it('should request the status from a miner once every second', function (done) {
        var numberOfUpdates = 0,
            bfgAdapter;

        bfgAdapter = new BfgAdapter();
        bfgAdapter.on('statusUpdate', function (data) {
            expect(data).to.deep.equal(expectedStatusUpdate);
            numberOfUpdates = numberOfUpdates + 1;
            if (numberOfUpdates === 3) {
                bfgAdapter.removeAllListeners();
                done();
            }
        });
    });

    it('should trigger a status update with the miner status as disconnected when an error occurs on a status update', function (done) {
        var bfgAdapter;

        bfgAdapter = new BfgAdapter();
        setTimeout(function () {
            netEmitter.emit('error', new Error('Test Error'));
        }, 15);
        bfgAdapter.on('statusUpdate', function (data) {
            expect(data).to.deep.equal({
                miner: {
                    connected: false,
                    error: 'Error: Test Error'
                }
            });
            bfgAdapter.removeAllListeners();
            done();
        });
    });

    it('should call registered middlewares to augment the data returned by the miner', function (done) {
        var bfgAdapter;

        bfgAdapter = new BfgAdapter();

        bfgAdapter.use(function (data, callback) {
            data.testMiddleware = 'foobar';
            callback(null);
        });

        bfgAdapter.on('statusUpdate', function (data) {
            expect(data.testMiddleware).to.equal('foobar');
            bfgAdapter.removeAllListeners();
            done();
        });
    });

});