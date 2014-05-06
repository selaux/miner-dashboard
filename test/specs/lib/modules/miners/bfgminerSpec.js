'use strict';

var EventEmitter = require('events').EventEmitter,
    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    _ = require('lodash'),
    moment = require('moment'),
    SandboxedModule = require('sandboxed-module'),

    BfgAdapter = require('../../../../../lib/modules/miners/bfgminer'),

    config = {
        host: 'some.host',
        port: 1111
    };

chai.use(sinonChai);

describe('modules/miners/bfgminer', function () {
    var app;

    beforeEach(function () {
        app = { logger: { debug: sinon.stub(), info: sinon.stub() } };
    });

    describe('initialize', function () {
        var fakeTimer;

        beforeEach(function () {
            sinon.stub(BfgAdapter.prototype, 'update');
            fakeTimer = sinon.useFakeTimers('setInterval');
        });

        afterEach(function () {
            BfgAdapter.prototype.update.restore();
            fakeTimer.restore();
        });

        it('should request the status from a miner on instantiation', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.update).to.have.been.calledOnce;
        });

        it('should request the status from a miner once every second per default', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            fakeTimer.tick(1010);
            expect(bfgAdapter.update).to.have.been.calledTwice;
            fakeTimer.tick(1010);
            expect(bfgAdapter.update).to.have.been.calledThrice;
        });

        it('should request the status from a miner with the specified interval', function () {
            var bfgAdapter = new BfgAdapter(app, {
                    host: 'abc',
                    port: 1,
                    interval: 250
                });
            fakeTimer.tick(260);
            expect(bfgAdapter.update).to.have.been.calledTwice;
            fakeTimer.tick(260);
            expect(bfgAdapter.update).to.have.been.calledThrice;
        });

        it('should use the id as a title when no title is set', function () {
            var bfgAdapter = new BfgAdapter(app, { id: 'someId' });
            expect(bfgAdapter.title).to.equal('someId');
        });

        it('should use the config title property as title when it is set', function () {
            var bfgAdapter = new BfgAdapter(app, { title: 'Some Title' });
            expect(bfgAdapter.title).to.equal('Some Title');
        });
    });

    describe('update', function () {
        var commands = [
                'summary',
                'devs',
                'pools'
            ],
            responseData,
            parsedData,
            bfgAdapterStub;

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        beforeEach(function () {
            responseData = {
                summary: { currentHashrate: 123 },
                devs: [ { currentHashrate: 124 } ],
                pools: [ { pool: 'data' } ]
            };
            parsedData = {
                summary: { currentHashrate: 123 },
                devs: [ { currentHashrate: 124 } ],
                pools: [ { pool: 'data' } ]
            };
            bfgAdapterStub = {
                id: 'someId',
                app: app,
                sendCommand: sinon.stub(),
                handleSummaryResponse: sinon.stub(),
                handleDevsResponse: sinon.stub(),
                handlePoolsResponse: sinon.stub()
            };
        });

        it('should call the sendCommand method and use the data it returns', function (done) {
            bfgAdapterStub.set = function (data) {
                commands.forEach(function (command) {
                    expect(bfgAdapterStub['handle' + capitalizeFirstLetter(command) + 'Response']).to.have.been.calledOnce;
                });

                expect(bfgAdapterStub.sendCommand).to.have.been.calledThrice;

                expect(app.logger.debug).to.have.been.calledThrice;
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched summary',
                    bfgAdapterStub.id,
                    JSON.stringify(responseData.summary)
                );
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched devs',
                    bfgAdapterStub.id,
                    JSON.stringify(responseData.devs)
                );
                expect(app.logger.debug).to.have.been.calledWith(
                    '%s - fetched pools',
                    bfgAdapterStub.id,
                    JSON.stringify(responseData.pools)
                );

                expect(data).to.deep.equal(_.extend({}, parsedData.summary, {
                    devices: parsedData.devs,
                    pools: parsedData.pools
                }));
                done();
            };

            commands.forEach(function (command) {
                bfgAdapterStub.sendCommand.withArgs(command).yieldsAsync(null, responseData[command]);
                bfgAdapterStub['handle' + capitalizeFirstLetter(command) + 'Response'].returns(responseData[command]);
            });

            BfgAdapter.prototype.update.call(bfgAdapterStub);
        });

        it('should sum up the device hashrates if the current hashrate is not returned in the summary', function (done) {
            responseData.summary = {};

            bfgAdapterStub.set = function (data) {
                commands.forEach(function (command) {
                    expect(bfgAdapterStub['handle' + capitalizeFirstLetter(command) + 'Response']).to.have.been.calledOnce;
                });

                expect(bfgAdapterStub.sendCommand).to.have.been.calledThrice;

                expect(data).to.deep.equal(_.extend({}, { currentHashrate: 124 }, {
                    devices: parsedData.devs,
                    pools: parsedData.pools
                }));
                done();
            };

            commands.forEach(function (command) {
                bfgAdapterStub.sendCommand.withArgs(command).yieldsAsync(null, responseData[command]);
                bfgAdapterStub['handle' + capitalizeFirstLetter(command) + 'Response'].returns(responseData[command]);
            });

            BfgAdapter.prototype.update.call(bfgAdapterStub);
        });

        commands.forEach(function (command) {
            it('should trigger a status update with the miner status as disconnected when an error occurs with the ' + command + ' command', function (done) {
                var otherCommands = _.without(commands, command),
                    err = new Error('Test Error');

                bfgAdapterStub.set = function (data) {
                    expect(bfgAdapterStub['handle' + capitalizeFirstLetter(command) + 'Response']).not.to.have.beenCalled;
                    expect(bfgAdapterStub.sendCommand).to.have.been.calledThrice;

                    expect(app.logger.info).to.have.been.calledOnce;
                    expect(app.logger.info).to.have.been.calledWith('%s - error fetching data', bfgAdapterStub.id, err);

                    expect(data).to.deep.equal({
                        connected: false,
                        currentHashrate: 0,
                        error: 'Error: Test Error'
                    });
                    done();
                };

                bfgAdapterStub.sendCommand.withArgs(command).yieldsAsync(err);
                otherCommands.forEach(function (otherCommand) {
                    bfgAdapterStub.sendCommand.withArgs(otherCommand).yieldsAsync(null, responseData[otherCommand]);
                    bfgAdapterStub['handle' + capitalizeFirstLetter(otherCommand) + 'Response'].returns(parsedData[otherCommand]);
                });

                BfgAdapter.prototype.update.call(bfgAdapterStub);
            });
        });
    });

    describe('sendCommand', function () {
        var config = { host: 'some host', port: 1234 },
            response = { some: 'response' },
            netEmitter,
            responseString = JSON.stringify(response) + '\x00',
            netModuleStub = {},
            netConnect = function (responseData, throwErrorOnConnection, throwErrorOnTransmission) {
                return function (options, callback) {
                    netEmitter = new EventEmitter();

                    netEmitter.options = options;

                    netEmitter.write = function (written) {
                        var packet1,
                            packet2;

                        netEmitter.written = JSON.parse(written);

                        packet1 = responseData.slice(0,5);
                        packet2 = responseData.slice(5);
                        setTimeout(function () {
                            netEmitter.emit('data', packet1);
                            if (throwErrorOnTransmission) {
                                netEmitter.emit('error', new Error('Error on transmission'));
                            } else {
                                setTimeout(function () {
                                    netEmitter.emit('data', packet2);
                                    netEmitter.emit('end');
                                }, 20);
                            }
                        }, 20);
                    };
                    if (throwErrorOnConnection) {
                        setTimeout(function () {
                            netEmitter.emit('error', new Error('Error on connection'));
                        }, 10);
                    } else {
                        setTimeout(callback, 20);
                    }

                    return netEmitter;
                };
            },

            BfgAdapter = SandboxedModule.require('../../../../../lib/modules/miners/bfgminer', {
                requires: {
                    'net': netModuleStub
                }
            });

        it('should callback with the returned data', function (done) {
            netModuleStub.connect = netConnect(responseString);

            BfgAdapter.prototype.sendCommand.call({
                config: config
            }, 'some command', 'some parameters', function (err, data) {
                expect(err).not.to.be.ok;
                expect(netEmitter.options).to.deep.equal(config);
                expect(netEmitter.written).to.deep.equal({
                    command: 'some command',
                    parameter: 'some parameters'
                });
                expect(data).to.deep.equal(response);
                done();
            });
        });

        it('should callback with an error when the miner returns invalid json', function (done) {
            netModuleStub.connect = netConnect('Invalid JSON');

            BfgAdapter.prototype.sendCommand.call({
                config: config
            }, 'some command', 'some parameters', function (err) {
                expect(err).to.be.ok;
                expect(err.message).to.equal('Unexpected token I');
                done();
            });
        });

        it('should callback with an error when an error occurs on connection', function (done) {
            netModuleStub.connect = netConnect(responseString, true);

            BfgAdapter.prototype.sendCommand.call({
                config: config
            }, 'some command', 'some parameters', function (err) {
                expect(err).to.be.ok;
                expect(err.message).to.equal('Error on connection');
                done();
            });
        });

        it('should callback with an error when an error occurs on transmission', function (done) {
            netModuleStub.connect = netConnect(responseString, false, true);

            BfgAdapter.prototype.sendCommand.call({
                config: config
            }, 'some command', 'some parameters', function (err) {
                expect(err).to.be.ok;
                expect(err.message).to.equal('Error on transmission');
                done();
            });
        });
    });

    describe('handleSummaryResponse', function () {
        var summaryResponse = {
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
                        'MHS 10s': 12.000,
                        'MHS av': 21.000,
                        'Network Blocks': 13,
                        'Rejected': 14,
                        'Remote Failures': 15,
                        'Stale': 16,
                        'Total MH': 17,
                        'Utility': 18,
                        'Work Utility': 19
                    }
                ]
            },
            parsedResponse = {
                connected: true,
                elapsed: 6,
                description: 'test miner 0.1',
                averageHashrate: 21.000,
                currentHashrate: 12.000,
                hardwareErrors: 10,
                hardwareErrorRate: 50,
                shares: {
                    accepted: 20,
                    rejected: 14,
                    rejectedPercentage: 100 * 3.0 / 9.0,
                    best: 1,
                    stale: 16,
                    stalePercentage: 100 * 4.0 / 9.0,
                    discarded: 5
                },
                difficulty: {
                    accepted: 2.0,
                    rejected: 3.0,
                    stale: 4.0
                }
            };

        it('should handle a correct response', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handleSummaryResponse(summaryResponse)).to.deep.equal(parsedResponse);
        });

        it('should handle a correct response with a Device Hardware% property', function () {
            var summary = _.extend({}, summaryResponse.SUMMARY[0], { 'Device Hardware%': 58 }),
                response = _.extend({}, summaryResponse, { SUMMARY: [ summary ] }),
                bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handleSummaryResponse(response)).to.deep.equal(_.extend({}, parsedResponse, {
                hardwareErrorRate: 58
            }));
        });

        it('should handle a response containing GHS instead of MHS', function () {
            var summary,
                response,
                bfgAdapter = new BfgAdapter(app, config);

            summary =  _.extend({}, _.omit(summaryResponse.SUMMARY[0], 'MHS 10s', 'MHS av'), { 'GHS 10s': 58, 'GHS av': 128 });
            response = _.extend({}, summaryResponse, { SUMMARY: [ summary ] });

            expect(bfgAdapter.handleSummaryResponse(response)).to.deep.equal(_.extend({}, parsedResponse, {
                averageHashrate: 128000,
                currentHashrate: 58000
            }));
        });

        it('should handle a response containing "MHS av" only', function () {
            var summary,
                response,
                bfgAdapter = new BfgAdapter(app, config);

            summary =  _.extend({}, _.omit(summaryResponse.SUMMARY[0], 'MHS 10s'), { 'MHS av': 58 });
            response = _.extend({}, summaryResponse, { SUMMARY: [ summary ] });

            expect(bfgAdapter.handleSummaryResponse(response)).to.deep.equal(_.extend({}, parsedResponse, {
                averageHashrate: 58,
                currentHashrate: undefined
            }));
        });

        it('should correctly calculate percentages if no work has been done yet', function () {
            var summary = _.extend({}, summaryResponse.SUMMARY[0], { 'Difficulty Accepted': 0, 'Difficulty Rejected': 0, 'Difficulty Stale': 0 }),
                response = _.extend({}, summaryResponse, { SUMMARY: [ summary ] }),
                bfgAdapter = new BfgAdapter(app, config);

            expect(bfgAdapter.handleSummaryResponse(response)).to.deep.equal(_.extend({}, parsedResponse, {
                difficulty: {
                    accepted: 0,
                    rejected: 0,
                    stale: 0
                },
                shares: _.extend({}, parsedResponse.shares, {
                    rejectedPercentage: 0,
                    stalePercentage: 0
                })
            }));
        });

        it('should handle a response not containing the SUMMARY property', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handleSummaryResponse({})).to.deep.equal({
                connected: false
            });
        });

    });

    describe('handleDevsResponse', function () {
        var devicesResponse = {
                DEVS: [
                    {
                        'Status': 'Alive',
                        'ID': 0,
                        'Name': 'One Mining Device',
                        'Hardware Errors': 1,
                        'Accepted': 2,
                        'MHS 100s': 3,
                        'Temperature': 40
                    },
                    {
                        'Status': 'Other Status',
                        'ID': 1,
                        'Name': 'Different Mining Device',
                        'Hardware Errors': 4,
                        'Accepted': 16,
                        'MHS 300s': 9,
                        'Temperature': 50
                    }
                ]
            },
            parsedResponse = [
                {
                    connected: true,
                    id: 0,
                    description: 'One Mining Device',
                    hardwareErrors: 1,
                    hardwareErrorRate: 50,
                    currentHashrate: 3,
                    temperature: 40
                },
                {
                    connected: false,
                    id: 1,
                    description: 'Different Mining Device',
                    hardwareErrors: 4,
                    hardwareErrorRate: 25,
                    currentHashrate: 9,
                    temperature: 50
                }
            ];

        it('should handle a correct response', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handleDevsResponse(devicesResponse)).to.deep.equal(parsedResponse);
        });

        it('should handle a correct response with a Device Hardware% property', function () {
            var response = {
                    DEVS: devicesResponse.DEVS.map(function (dev, it) {
                        return _.extend({
                            'Device Hardware%': it
                        }, dev);
                    })
                },
                bfgAdapter = new BfgAdapter(app, config);

            expect(bfgAdapter.handleDevsResponse(response)).to.deep.equal(parsedResponse.map(function (dev, it) {
                return _.extend({}, dev, { hardwareErrorRate: it });
            }));
        });

        it('should handle a response not containing the DEVS property', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handleDevsResponse({})).to.deep.equal([]);
        });

    });

    describe('handlePoolsResponse', function () {
        var poolsResponse = {
            POOLS: [
                {
                    'Status': 'Alive',
                    'POOL': 0,
                    'Priority': 0,
                    'URL': 'http://some.url:3030',
                    'Last Share Time': 1383752634
                },
                {
                    'Status': 'Sick',
                    'POOL': 1,
                    'Priority': 1,
                    'URL': 'http://other.url:3030',
                    'Last Share Time': 0
                }
            ]
        };

        it('should handle a correct response', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handlePoolsResponse(poolsResponse)).to.deep.equal([
                {
                    alive: true,
                    id: 0,
                    priority: 0,
                    url: 'http://some.url:3030',
                    active: true,
                    lastShareTime: 1383752634000
                },
                {
                    alive: false,
                    id: 1,
                    priority: 1,
                    url: 'http://other.url:3030',
                    active: false,
                    lastShareTime: undefined
                }
            ]);
        });

        it('should handle a response containing the elapsed time since last share as a string', function () {
            var bfgAdapter = new BfgAdapter(app, config),
                pool1 = {
                    'Status': 'Alive',
                    'POOL': 0,
                    'Priority': 0,
                    'URL': 'http://some.url:3030',
                    'Last Share Time': '0:01:30'
                },
                pool2 = {
                    'Status': 'Alive',
                    'POOL': 1,
                    'Priority': 1,
                    'URL': 'http://some.other.url:3030',
                    'Last Share Time': '0'
                },
                response = { POOLS: [ pool1, pool2 ] };

            expect(bfgAdapter.handlePoolsResponse(response)).to.deep.equal([{
                alive: true,
                id: 0,
                priority: 0,
                url: 'http://some.url:3030',
                lastShareTime: moment().startOf('minute').subtract('seconds', 90).toDate().getTime(),
                active: true
            },{
                alive: true,
                id: 1,
                priority: 1,
                url: 'http://some.other.url:3030',
                lastShareTime: undefined,
                active: false
            }]);
        });

        it('should handle a response not containing the POOLS property', function () {
            var bfgAdapter = new BfgAdapter(app, config);
            expect(bfgAdapter.handlePoolsResponse({})).to.deep.equal([]);
        });

    });

    describe('set', function () {
        it('should add the currentHashrate value to historicalData', function () {
            var bfgAdapter = new BfgAdapter(app, config),
                now = new Date().getTime();

            bfgAdapter.set({ currentHashrate: 123 });
            expect(bfgAdapter.get('historicalData')).to.have.length(1);
            expect(bfgAdapter.get('historicalData')[0].currentHashrate).to.equal(123);
            expect(bfgAdapter.get('historicalData')[0].timestamp).to.be.within(now-1, now+1);
        });
    });

});