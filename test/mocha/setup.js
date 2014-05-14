'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    chaiAsPromised = require('chai-as-promised'),
    expect = chai.expect;

chai.use(sinonChai);
chai.use(chaiAsPromised);

global.expect = expect;
global.sinon = sinon;