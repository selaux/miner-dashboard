'use strict';

var chai = require('chai'),
    expect = chai.expect,

    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    SandboxedModule = require('sandboxed-module'),

    View = require('../../../lib/View');

chai.use(sinonChai);

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
            expect(view.template).to.equal(jsonTemplate);
            expect(view.noDataTemplate).to.equal(noDataTemplate);
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
                    data: { some: 'json', data: 'of', the: 'module' }
                },
                view = new View(module);

            view.template = sinon.stub();

            view.renderViewWithData();

            expect(view.template).to.have.been.calledOnce;
            expect(view.template).to.have.been.calledWithMatch({
                id: module.id,
                title: module.title,
                json: JSON.stringify(module.data),
                some: 'json',
                data: 'of',
                the: 'module'
            });
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
            View = SandboxedModule.require('../../../lib/View', {
                requires: requires
            });

        it('should compile the template residing on the disk', function () {
            var result = View.prototype.getCompiledTemplate('templateName');

            expect(requires.fs.readFileSync).to.have.been.calledOnce;
            expect(requires['./handlebars/handlebars'].compile).to.have.been.calledOnce;
            expect(requires['./handlebars/handlebars'].compile).to.have.been.calledWith('template string');
            expect(result).to.equal(compiledTemplate);
        });
    });
});