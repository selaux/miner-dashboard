'use strict';

var SandboxedModule = require('sandboxed-module'),

    View = require('../../../lib/View');

describe('View', function () {
    describe('constructor', function () {
        var noDataTemplate = function () {},
            jsonTemplate = function () {};

        beforeEach(function () {
            sinon.stub(View.prototype, 'getCompiledTemplate');
            View.prototype.template = 'json';
            View.prototype.getCompiledTemplate.withArgs('noData').returns(noDataTemplate);
            View.prototype.getCompiledTemplate.withArgs('json').returns(jsonTemplate);
        });

        afterEach(function () {
            View.prototype.getCompiledTemplate.restore();
            delete View.prototype.template;
        });

        it('should set the instance properties correctly', function () {
            var module = { template: 'json' },
                view = new View(module);

            expect(view.module).to.equal(module);
            expect(view.compiledTemplate).to.equal(jsonTemplate);
            expect(view.noDataTemplate).to.equal(noDataTemplate);
        });
    });

    describe('className', function () {
        var module,
            view;

        beforeEach(function () {
            module = {
                attributes: {},
                has: sinon.stub(),
                get: sinon.stub(),
                viewId: 'someView'
            };
            view = new View(module);
        });

        it('should add panel-warning and noData classes when no data has been fetched yet', function () {
            expect(view.className()).to.equal('panel panel-warning noData');
        });

        it('should add panel-success and viewId classes if there is no connection info for the module', function () {
            module.attributes.foo = 'bar';
            module.has.withArgs('connected').returns(false);
            expect(view.className()).to.equal('panel panel-success someView');
        });

        it('should add panel-success and viewId classes if there is connection info and the connection is ok', function () {
            module.attributes.foo = 'bar';
            module.has.withArgs('connected').returns(true);
            module.get.withArgs('connected').returns(true);
            expect(view.className()).to.equal('panel panel-success someView');
        });

        it('should add panel-danger and viewId classes if there is connection info and the module is disconnected', function () {
            module.attributes.foo = 'bar';
            module.has.withArgs('connected').returns(true);
            module.get.withArgs('connected').returns(false);
            expect(view.className()).to.equal('panel panel-danger someView');
        });
    });

    describe('renderViewWithoutData', function () {
        it('should render the default no-data view', function () {
            var module = {
                    id: 'foo',
                    template: 'json',
                    title: 'bar'
                },
                view = new View(module);

            view.noDataTemplate = sinon.stub();

            view.renderViewWithoutData();

            expect(view.noDataTemplate).to.have.been.calledOnce;
            expect(view.noDataTemplate).to.have.been.calledWith({
                id: module.id,
                title: module.title
            });
        });
    });

    describe('renderViewWithData', function () {
        it('should render a json representation of the data by default', function () {
            var module = {
                    id: 'foo',
                    template: 'json',
                    title: 'bar',
                    attributes: { some: 'json', data: 'of', the: 'module' },
                    lastUpdated: 123,
                    has: sinon.stub().returns(false)
                },
                view = new View(module);

            view.compiledTemplate = sinon.stub();

            view.renderViewWithData();

            expect(view.compiledTemplate).to.have.been.calledOnce;
            expect(view.compiledTemplate).to.have.been.calledWithMatch({
                id: module.id,
                title: module.title,
                lastUpdated: 123,
                json: JSON.stringify(module.attributes),
                some: 'json',
                data: 'of',
                the: 'module'
            });
        });
    });

    describe('getCompiledTemplate', function () {
        var compiledTemplate = function () {},
            compiledTemplatesStub = sinon.stub().returns({ templateName: compiledTemplate }),
            requires = {
                '../build/compiledTemplates': compiledTemplatesStub
            },
            View = SandboxedModule.require('../../../lib/View', {
                requires: requires
            });

        it('should compile the template residing on the disk', function () {
            var result = View.prototype.getCompiledTemplate('templateName');

            expect(compiledTemplatesStub).to.have.been.calledOnce;
            expect(result).to.equal(compiledTemplate);
        });
    });
});