'use strict';

var chai = require('chai'),
    expect = chai.expect,
    _ = require('lodash'),

    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    SandboxedModule = require('sandboxed-module'),

    Module = require('../../../lib/ServerModule');

chai.use(sinonChai);

describe('ServerModule', function () {

    describe('extend', function () {
        it('should return a constructor that extends the ServerModule', function () {
            var extendedModule = Module.extend({ some: 'new property' });

            expect(_.omit(extendedModule.prototype, 'some', 'constructor')).to.deep.equal(Module.prototype);
            expect(extendedModule.prototype.some).equal('new property');
        });
    });

    describe('constructor', function () {
        var noDataTemplateStub;

        beforeEach(function () {
            noDataTemplateStub = sinon.stub().returns('rendered template');
            sinon.stub(Module.prototype, 'getCompiledTemplate').returns(noDataTemplateStub);
        });

        afterEach(function () {
            Module.prototype.getCompiledTemplate.restore();
        });

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

            expect(noDataTemplateStub).to.have.been.calledOnce;
            expect(noDataTemplateStub).to.have.been.calledWith({
                id: module.id,
                title: module.title
            });
            expect(module.view).to.equal('rendered template');

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
            module.noDataTemplate = sinon.stub();

            module.renderViewWithoutData();
            expect(module.noDataTemplate).to.have.been.calledOnce;
            expect(module.noDataTemplate).to.have.been.calledWith({
                id: module.id,
                title: module.title
            });
        });
    });

    describe('renderView', function () {
        it('should render a json representation of the data by default', function () {
            var module = new Module();

            module.id = 'foo';
            module.title = 'bar';
            module.data = { some: 'json', data: 'of', the: 'module' };
            module.template = sinon.stub();

            module.renderView();

            expect(module.template).to.have.been.calledOnce;
            expect(module.template).to.have.been.calledWithMatch({
                id: module.id,
                title: module.title,
                json: JSON.stringify(module.data),
                some: 'json',
                data: 'of',
                the: 'module'
            });
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

    describe('getCompiledTemplate', function () {
        var compiledTemplate = function () {},
            requires = {
                fs: {
                    readFileSync: sinon.stub().returns('template string')
                },
                './handlebars/handlebars': {
                    compile: sinon.stub().returns(compiledTemplate)
                }
            },
            Module = SandboxedModule.require('../../../lib/ServerModule', {
                requires: requires
            });

        it('should compile the template residing on the disk', function () {
            var result = Module.prototype.getCompiledTemplate('templateName');

            expect(requires.fs.readFileSync).to.have.been.calledOnce;
            expect(requires['./handlebars/handlebars'].compile).to.have.been.calledOnce;
            expect(requires['./handlebars/handlebars'].compile).to.have.been.calledWith('template string');
            expect(result).to.equal(compiledTemplate);
        });
    });
});