'use strict';

var EventEmitter = require('events').EventEmitter,
    
    chai = require('chai'),
    expect = chai.expect,
    SandboxedModule = require('sandboxed-module'),

    nodemailerStub = {},
    Mail = SandboxedModule.require('../../../../../lib/modules/notification/mail', {
        requires: {
            'nodemailer': nodemailerStub
        }
    }),
    app;

describe('modules/notification/mail', function () {

    beforeEach(function () {
        app = new EventEmitter();
        app.modules = [];
        app.title = 'Some Title';
        nodemailerStub.createTransport = function () {};
    });

    it('should send an email when the app triggers data that causes notifications to appear', function (done) {
        var config = {
                transport: { some: 'transport', conf: 'iguration' },
                from: 'some-miner@gugl.com',
                to: [ 'email@address.co', 'otheremail@address.co' ],
                cc: [ 'cc@address.co' ],
                notifyOn: {
                    minAvgHashrate: 10
                }
            },
            module = new EventEmitter(),
            mail;

        module.id = 'moduleId';
        app.modules.push(module);
        nodemailerStub.createTransport = function (protocol, transportParams) {
            expect(protocol).to.equal('SMTP');
            expect(transportParams).to.deep.equal(config.transport);
            return {
                sendMail: function (params) {
                    expect(params).to.deep.equal({
                        from: config.from,
                        to: config.to,
                        cc: config.cc,
                        subject: 'Some Title: Status Update',
                        text: 'Hashrate 0 MH/s of moduleId has dropped below 10 MH/s'
                    });
                    done();
                }
            };
        };

        mail = new Mail(app, config);

        module.emit('update:data', { averageHashrate: 0 });
    });

    describe('getNotifications', function () {

        describe('minAvgHashrate', function () {

            it('should notify if any miner falls below the specified hashrate when only a number is specified', function () {
                var config = {
                        notifyOn: {
                            minAvgHashrate: 0
                        }
                    },
                    mail = new Mail(app, config);

                expect(mail.getNotifications('someModule', { averageHashrate: 0 })).to.deep.equal([
                    'Hashrate 0 MH/s of someModule has dropped below 0 MH/s'
                ]);
                expect(mail.getNotifications('otherModule', { averageHashrate: 0 })).to.deep.equal([
                    'Hashrate 0 MH/s of otherModule has dropped below 0 MH/s'
                ]);
            });

            it('should notify if any miner falls below its specific hashrate when a object is specified', function () {
                var config = {
                        notifyOn: {
                            minAvgHashrate: {
                                someModule: 100,
                                otherModule: 50
                            }
                        }
                    },
                    mail = new Mail(app, config);

                expect(mail.getNotifications('someModule', { averageHashrate: 75 })).to.deep.equal([
                    'Hashrate 75 MH/s of someModule has dropped below 100 MH/s'
                ]);
                expect(mail.getNotifications('otherModule', { averageHashrate: 75 })).to.deep.equal([]);
                expect(mail.getNotifications('otherModule', { averageHashrate: 49 })).to.deep.equal([
                    'Hashrate 49 MH/s of otherModule has dropped below 50 MH/s'
                ]);
            });

            it('should only notify again if the same miner goes above the specified hashrate and back below again', function () {
                var config = {
                        notifyOn: {
                            minAvgHashrate: 0
                        }
                    },
                    mail = new Mail(app, config);

                expect(mail.getNotifications('someModule', { averageHashrate: 0 })).to.deep.equal([
                    'Hashrate 0 MH/s of someModule has dropped below 0 MH/s'
                ]);
                expect(mail.getNotifications('someModule', { averageHashrate: 0 })).to.deep.equal([]);
                expect(mail.getNotifications('otherModule', { averageHashrate: 0 })).to.deep.equal([
                    'Hashrate 0 MH/s of otherModule has dropped below 0 MH/s'
                ]);
                expect(mail.getNotifications('someModule', { averageHashrate: 10 })).to.deep.equal([]);
                expect(mail.getNotifications('someModule', { averageHashrate: 0 })).to.deep.equal([
                    'Hashrate 0 MH/s of someModule has dropped below 0 MH/s'
                ]);
            });

        });

        describe('disconnect', function () {

            it('should notify if any module gets disconnected', function () {
                var config = {
                        notifyOn: {
                            disconnect: true
                        }
                    },
                    mail = new Mail(app, config);

                expect(mail.getNotifications('someModule', { connected: false })).to.deep.equal([
                    'someModule has disconnected'
                ]);
            });

            it('should only notify if the same module gets connected again after disconnect', function () {
                var config = {
                        notifyOn: {
                            disconnect: true
                        }
                    },
                    mail = new Mail(app, config);

                expect(mail.getNotifications('someModule', { connected: false })).to.deep.equal([
                    'someModule has disconnected'
                ]);
                expect(mail.getNotifications('someModule', { connected: false })).to.deep.equal([]);
                expect(mail.getNotifications('otherModule', { connected: false })).to.deep.equal([
                    'otherModule has disconnected'
                ]);
                expect(mail.getNotifications('someModule', { connected: true })).to.deep.equal([]);
                expect(mail.getNotifications('someModule', { connected: false })).to.deep.equal([
                    'someModule has disconnected'
                ]);
            });


        });
    });

});