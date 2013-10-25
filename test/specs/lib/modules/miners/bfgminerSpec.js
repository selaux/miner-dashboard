'use strict';

var EventEmitter = require('events').EventEmitter,
    chai = require('chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),

    summaryResponse = JSON.stringify({
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
                'Accepted': 20,
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
    devicesResponse = JSON.stringify({
        DEVS: [
            {
                'Status': 'Alive',
                'ID': 0,
                'Name': 'One Mining Device',
                'Hardware Errors': 1,
                'Accepted': 2,
                'MHS 300s': 3
            },
            {
                'Status': 'Other Status',
                'ID': 1,
                'Name': 'Different Mining Device',
                'Hardware Errors': 4,
                'Accepted': 16,
                'MHS 300s': 9
            }
        ]
    }) + '\x00',
    expectedStatusUpdate = {
        connected: true,
        description: 'test miner 0.1',
        avgHashrate: 12.000,
        hardwareErrors: 10,
        hardwareErrorRate: 0.5,
        shares: {
            accepted: 20,
            rejected: 14,
            best: 1,
            stale: 16,
            discarded: 5
        },
        difficulty: {
            accepted: 2.0,
            rejected: 3.0,
            stale: 4.0,
        },
        devices: [
            {
                connected: true,
                id: 0,
                description: 'One Mining Device',
                hardwareErrors: 1,
                hardwareErrorRate: 0.5,
                avgHashrate: 3
            },
            {
                connected: false,
                id: 1,
                description: 'Different Mining Device',
                hardwareErrors: 4,
                hardwareErrorRate: 0.25,
                avgHashrate: 9
            }
        ]
    },

    commandToData = {
        summary: summaryResponse,
        devs: devicesResponse
    },

    netEmitter,
    netConnect = function (options, callback) {
        var emitter = new EventEmitter();
        
        netEmitter = emitter;

        emitter.write = function (written) {
            written = JSON.parse(written);
            setTimeout(function () {
                emitter.emit('data', commandToData[written.command]);
                emitter.emit('end');
            }, 50);
        };
        setTimeout(callback, 10);

        return emitter;
    },

    BfgAdapter = SandboxedModule.require('../../../../../lib/modules/miners/bfgminer', {
        requires: {
            'net': {
                connect: netConnect
            }
        }
    }),

    config = {
        host: 'some.host',
        port: 1111,
        interval: 500
    };

describe('modules/miners/bfgminer', function () {

    afterEach(function () {
        netEmitter.removeAllListeners();
    });

    it('should request the status from a miner on instantiation', function (done) {
        var app = {},
            bfgAdapter = new BfgAdapter(app, config);

        bfgAdapter.on('update:data', function (data) {
            expect(data).to.deep.equal(expectedStatusUpdate);
            bfgAdapter.removeAllListeners();
            done();
        });
    });

    it('should request the status from a miner once every second', function (done) {
        var app = {},
            numberOfUpdates = 0,
            bfgAdapter = new BfgAdapter(app, config);

        bfgAdapter.on('update:data', function (data) {
            expect(data).to.deep.equal(expectedStatusUpdate);
            numberOfUpdates = numberOfUpdates + 1;
            if (numberOfUpdates === 3) {
                bfgAdapter.removeAllListeners();
                done();
            }
        });
    });

    it('should trigger a status update with the miner status as disconnected when an error occurs on a status update', function (done) {
        var app = {},
            bfgAdapter = new BfgAdapter(app, config);

        setTimeout(function () {
            netEmitter.emit('error', new Error('Test Error'));
        }, 25);

        bfgAdapter.on('update:data', function (data) {
            expect(data).to.deep.equal({
                connected: false,
                error: 'Error: Test Error'
            });
            bfgAdapter.removeAllListeners();
            done();
        });
    });

    it('should continue requesting the status after an error occured on connection', function (done) {
        var app = {},
            bfgAdapter = new BfgAdapter(app, config),
            statusUpdate = 0;

        setTimeout(function () {
            netEmitter.emit('error', new Error('Test Error 1'));
        }, 1);

        bfgAdapter.on('update:data', function (data) {
            statusUpdate = statusUpdate + 1;
            if (statusUpdate === 1) {
                expect(data).to.deep.equal({
                    connected: false,
                    error: 'Error: Test Error 1'
                });
            }
            if (statusUpdate === 2) {
                expect(data).to.deep.equal(expectedStatusUpdate);
                bfgAdapter.removeAllListeners();
                done();
            }
        });
    });

    it('should continue requesting the status after an error occured on a status update', function (done) {
        var app = {},
            bfgAdapter = new BfgAdapter(app, config),
            statusUpdate = 0;

        setTimeout(function () {
            netEmitter.emit('error', new Error('Test Error 1'));
        }, 25);

        bfgAdapter.on('update:data', function (data) {
            statusUpdate = statusUpdate + 1;
            if (statusUpdate === 1) {
                expect(data).to.deep.equal({
                    connected: false,
                    error: 'Error: Test Error 1'
                });
            }
            if (statusUpdate === 2) {
                expect(data).to.deep.equal(expectedStatusUpdate);
                bfgAdapter.removeAllListeners();
                done();
            }
        });
    });

    it('should use the id as a title when no title is set', function () {
        var app = {},
            bfgAdapter = new BfgAdapter(app, { id: 'someId' });

        expect(bfgAdapter.title).to.equal('someId');
    });

    it('should use the id as a title when no title is set', function () {
        var app = {},
            bfgAdapter = new BfgAdapter(app, { title: 'Some Title' });

        expect(bfgAdapter.title).to.equal('Some Title');
    });

});