'use strict';

var EventEmitter = require('events').EventEmitter,

    chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    App = require('../../../lib/App');

chai.use(sinonChai);

describe('App', function () {

    describe('constructor', function () {

        it('should add a static title view when a title is configured', function () {
            var app = new App({ title: 'Some Title' });

            expect(app.staticViews.before).to.deep.equal([
                {
                    type: 'h1',
                    value: 'Some Title'
                }
            ]);
        });

        it('should initialize the modules inside the modules array', function () {
            var module = new EventEmitter(),
                constructorStub = sinon.stub().returns(module),
                moduleConfig = {
                    id: 'someid',
                    module: constructorStub,
                    some: 'config'
                },
                app = new App({
                    modules: [moduleConfig]
                });

            expect(app.modules).to.have.length(1);
            expect(constructorStub).to.have.been.calledOnce;
            expect(constructorStub).to.have.been.calledWith(app, moduleConfig);
        });

        it('should set an uuid as moduleId for the modules that dont have an id', function () {
            var constructorStub = function (app, config) {
                    expect(app).to.be.ok;
                    expect(config.id).to.be.ok;
                    return new EventEmitter();
                },
                moduleConfig = {
                    module: constructorStub
                },
                app = new App({
                    modules: [moduleConfig]
                });

            expect(app).to.be.ok;
        });

        it('should setup a listener the update:data event', function (done) {
            var module = new EventEmitter(),
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
            
            module.emit('update:data', newData);
        });

        it('should setup a listener the update:view event', function (done) {
            var module = new EventEmitter(),
                constructorStub = sinon.stub().returns(module),
                moduleConfig = {
                    id: 'someid',
                    module: constructorStub,
                    some: 'config'
                },
                app = new App({
                    modules: [moduleConfig]
                }),
                newView = [
                    { some: 'view' }
                ];

            app.on('update:view:someid', function (data) {
                expect(data).to.deep.equal(newView);
                done();
            });
            
            module.emit('update:view', newView);
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

    describe('updateView', function () {
        it('should retrigger the event on the instance', function (done) {
            var app = new App({}),
                newData = { some: 'data' };

            app.on('update:view:someId', function (data) {
                expect(data).to.deep.equal(newData);
                done();
            });

            app.updateView('someId', newData);
        });
    });
});