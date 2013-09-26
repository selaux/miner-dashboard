'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),

    collectData = require('../../../utils/collectData');

describe('utils/collectData', function () {

    it('should collect data from all miners', function () {
        var config = {
                some: 'toplevelConfig'
            },
            adapters = [
                {
                    data: { some: 'data 1' },
                    config: { config: 'for 1' }
                },
                {
                    data: { some: 'data 2' },
                    config: { config: 'for 2' }
                }
            ],
            appStub = {
                get: sinon.stub()
            };

        appStub.get.withArgs('config').returns(config);
        appStub.get.withArgs('adapters').returns(adapters);

        expect(collectData(appStub)).to.deep.equal({
            connected: true,
            config: { some: 'toplevelConfig' },
            miners: [
                {
                    some: 'data 1',
                    config: { config: 'for 1' }
                },
                {
                    some: 'data 2',
                    config: { config: 'for 2' }
                }
            ]
        });
    });

});