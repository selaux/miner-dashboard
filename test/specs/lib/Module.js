'use strict';

var chai = require('chai'),
    expect = chai.expect,

    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),

    Module = require('../../../lib/Module');

chai.use(sinonChai);

describe('Module', function () {

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

            Module.prototype.defaults = oldDefaults;
            Module.prototype.initialize = oldInitialize;
            delete Module.prototype.title;
        });
    });

});