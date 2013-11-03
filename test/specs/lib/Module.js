'use strict';

var fs = require('fs'),
    path = require('path'),

    chai = require('chai'),
    expect = chai.expect,
    _ = require('lodash'),
    moment = require('moment'),

    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    Handlebars = require('../../../lib/handlebars/handlebars'),
    noDataTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../../../templates/noData.hbs')).toString()),
    jsonTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '/../../../templates/json.hbs')).toString()),
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
            Module.prototype.title = 'some title';

            module = new Module(app, config);

            expect(module.app).to.equal(app);
            expect(module.config).to.deep.equal({ other: 'config', some: 'defaults' });
            expect(module.initialize).to.have.been.calledOnce;
            expect(module.view).to.deep.equal(noDataTemplate({
                id: module.id,
                title: module.title
            }));

            Module.prototype.defaults = oldDefaults;
            Module.prototype.initialize = oldInitialize;
            delete Module.prototype.title;
        });
    });

    describe('renderViewWithoutData', function () {
        it('should render the default no-data view', function () {
            var module = new Module();

            module.id = 'foo';
            module.title = 'bar';
            expect(module.renderViewWithoutData()).to.deep.equal(noDataTemplate({
                id: module.id,
                title: module.title
            }));
        });
    });

    describe('renderView', function () {
        it('should render a json representation of the data by default', function () {
            var module = new Module();

            module.id = 'foo';
            module.title = 'bar';
            module.data = { some: 'json', data: 'of', the: 'module' },
            expect(module.renderView()).to.deep.equal(jsonTemplate({
                id: module.id,
                title: module.title,
                lastUpdated: moment().format('YYYY-MM-DD, hh:mm:ss'),
                json: JSON.stringify(module.data)
            }));
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
            var module = new Module();

            module.on('update:view', function (view) {
                expect(view).to.be.ok;
                done();
            });

            module.updateView();
        });
    });
});