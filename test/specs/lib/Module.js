'use strict';

var chai = require('chai'),
    expect = chai.expect,
    _ = require('lodash'),

    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    Module = require('../../../lib/Module');

chai.use(sinonChai);

describe('Module', function () {

    describe('extend', function () {
        it('should return a constructor that extends the Module', function () {
            var extendedModule = Module.extend({ some: 'new property' });

            expect(_.omit(extendedModule.prototype, 'some', 'constructor')).to.deep.equal(Module.prototype);
            expect(extendedModule.prototype.some).equal('new property');
        });
    });

    describe('constructor', function () {
        it('should set the instance properties correctly', function () {
            var oldDefaults = Module.prototype.defaults,
                oldInitialize = Module.prototype.initialize,
                app = {},
                config = { other: 'config' },
                module;

            Module.prototype.defaults = { some: 'defaults' };
            Module.prototype.initialize = sinon.spy();

            module = new Module(app, config);

            expect(module.app).to.equal(app);
            expect(module.config).to.deep.equal({ other: 'config', some: 'defaults' });
            expect(module.initialize).to.have.been.calledOnce;

            Module.prototype.defaults = oldDefaults;
            Module.prototype.initialize = oldInitialize;
        });
    });

    describe('updateData', function () {
        it('should trigger an event on the instance', function (done) {
            var module = new Module(),
                newData = { some: 'data' };

            module.on('update:data', function (data) {
                expect(data).to.deep.equal(newData);
                done();
            });

            module.updateData(newData);
        });
    });

    describe('updateView', function () {
        it('should retrigger the event on the instance', function (done) {
            var module = new Module(),
                newView = [ { some: 'view' } ];

            module.on('update:view', function (view) {
                expect(view).to.deep.equal(newView);
                done();
            });

            module.updateView(newView);
        });
    });
});