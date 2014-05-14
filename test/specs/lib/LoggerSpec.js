'use strict';

var winston = require('winston'),
    Logger = require('../../../lib/Logger');

describe('Logger', function () {
    it('should use a default transport to console with log level info', function () {
        var logger = new Logger();
        expect(logger.transports.console).to.be.ok;
        expect(logger.transports.console).to.be.an.instanceOf(winston.transports.Console);
        expect(logger.transports.console.level).to.equal('info');
    });

    it('should use a default transport to console with the specified log level', function () {
        var logger = new Logger({ level: 'debug' });
        expect(logger.transports.console).to.be.ok;
        expect(logger.transports.console).to.be.an.instanceOf(winston.transports.Console);
        expect(logger.transports.console.level).to.equal('debug');
    });

    it('should use custom transports if specified', function () {
        var transport = { name: 'custom', log: function () {}, on: function () {} },
            logger = new Logger({
                transports: [
                    transport
                ]
            });
        expect(logger.transports.custom).to.be.ok;
    });
});