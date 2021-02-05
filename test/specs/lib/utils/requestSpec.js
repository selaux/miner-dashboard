'use strict';

var EventEmitter = require('events').EventEmitter,
    sandboxedModule = require('sandboxed-module');

describe('request', function () {
    var requiredModules,
        request,
        req;

    function getMockResponse(statusCode, body) {
        var response = new EventEmitter();

        response.statusCode = statusCode;
        setImmediate(function () {
            response.emit('data', body);
        });
        setImmediate(function () {
            response.emit('end');
        });

        return response;
    }

    beforeEach(function () {
        requiredModules = {
            http: {},
            https: {}
        };
        request = sandboxedModule.require('../../../../lib/utils/request', {
            requires: requiredModules
        });
        req = new EventEmitter();
        req.end = sinon.stub();
    });

    [
        'http',
        'https'
    ].forEach(function (requestMethod) {
        describe(requestMethod, function () {
            it('should do a ' + requestMethod + ' request', function (done) {
                var response = { foo: 'bar' };

                requiredModules[requestMethod].request = sinon.stub()
                    .returns(req)
                    .yields(getMockResponse(200, JSON.stringify(response)));

                request(requestMethod + '://some.thing/asd?q=1', { an: 'option' }).then(function (response) {
                    expect(response).to.deep.equal({ foo: 'bar' });

                    expect(req.end).to.have.been.calledOnce;
                    expect(requiredModules[requestMethod].request).to.have.been.calledOnce;
                    expect(requiredModules[requestMethod].request).to.have.been.calledWith({
                        host: 'some.thing',
                        port: null,
                        method: 'GET',
                        path: '/asd?q=1',
                        an: 'option'
                    });
                    done();
                }).catch(done);
            });

            it('should reject when a non 200 status code is returned', function (done) {
                var response = '',
                    expectedError = requestMethod + '://some.thing/asd?q=1 returned status code 302';

                requiredModules[requestMethod].request = sinon.stub()
                    .returns(req)
                    .yields(getMockResponse(302, response));

                expect(request(requestMethod + '://some.thing/asd?q=1')).to.be.rejectedWith(expectedError).notify(done);
            });

            it('should reject when invalid json is returned', function (done) {
                var response = 'asd',
                    expectedError = 'Unexpected token a';

                requiredModules[requestMethod].request = sinon.stub()
                    .returns(req)
                    .yields(getMockResponse(200, response));

                expect(request(requestMethod + '://some.thing/asd?q=1')).to.be.rejectedWith(expectedError).notify(done);
            });

            it('should reject when the request emits an error event', function (done) {
                var expectedError = 'Test Error';

                requiredModules[requestMethod].request = sinon.stub().returns(req);
                setImmediate(function () {
                    req.emit('error', new Error(expectedError));
                });

                expect(request(requestMethod + '://some.thing/asd?q=1')).to.be.rejectedWith(expectedError).notify(done);
            });
        });
    });
});