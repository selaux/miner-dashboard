'use strict';

var EventEmitter = require('events').EventEmitter,

    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    Module = require('../../../lib/Module'),
    JSONView = require('../../../lib/views/json'),
    App = require('../../../lib/App');

chai.use(sinonChai);

describe('App', function () {

    describe('constructor', function () {

        it('should set a static title if one is configured', function () {
            var app = new App({ title: 'Some Title' });

            expect(app.title).to.deep.equal('Some Title');
        });

        it('should set a default title if one is configured', function () {
            var app = new App({});

            expect(app.title).to.deep.equal('Miner-Dashboard');
        });

        it('should initialize the modules and views inside the modules array', function () {
            var module = new EventEmitter({
                    wildcard: true,
                    delimiter: '::'
                }),
                constructorStub = sinon.stub().returns(module),
                moduleConfig = {
                    id: 'someid',
                    module: constructorStub,
                    some: 'config'
                },
                app;

            constructorStub.prototype.viewId = 'json';
            app = new App({
                modules: [moduleConfig]
            });

            expect(app.modules).to.have.length(1);
            expect(app.views).to.have.length(1);
            expect(app.views[0]).to.be.an.instanceOf(JSONView);
            expect(constructorStub).to.have.been.calledOnce;
            expect(constructorStub).to.have.been.calledWith(app, moduleConfig);
        });

        it('should set a reproducable hash as moduleId for the modules that dont have an id', function () {
            var moduleConfig = {
                    module: function (app, config) { return new Module(app, config); }
                },
                app = new App({
                    modules: [moduleConfig]
                });

            expect(app).to.be.ok;
            expect(app.modules[0].id).to.equal('72c8061bc4e6ff90df26bdc3003327ed60e02d7d');
        });

        it('should setup a listener the change event', function (done) {
            var module = new EventEmitter({
                    wildcard: true,
                    delimiter: '::'
                }),
                constructorStub = sinon.stub().returns(module),
                moduleConfig = {
                    id: 'someid',
                    module: constructorStub,
                    some: 'config'
                },
                app = new App({
                    modules: [moduleConfig]
                }),
                newData = {
                    some: 'data'
                };

            app.on('update:data:someid', function (data) {
                expect(data).to.deep.equal(newData);
                done();
            });
            
            module.toJSON = sinon.stub().returns(newData);
            module.emit('change');
        });

    });

    describe('updateData', function () {
        it('should retrigger the event on the instance', function (done) {
            var app = new App({}),
                newData = { some: 'data' };

            app.on('update:data:someId', function (data) {
                expect(data).to.deep.equal(newData);
                done();
            });

            app.updateData('someId', newData);
        });
    });

});