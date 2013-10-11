'use strict';

module.exports = function (app) {
    app.configure({
        title: 'My Mining Operations',
        webinterface: {
            port: 3000
        },
        modules: [
            {
                id: 'miner1',
                module: 'miners/bfgminer',
                name: 'Some Device Name',
                host: '127.0.0.1',
                port: 4028,
                interval: 2500
            },
            {
                module: 'earnings/solo',
                miner: 'miner1',
                market: 'market1',
                technical: 'technical1'
            },
            {
                id: 'market1',
                module: 'markets/bitcoincharts',
                symbol: 'mtgoxUSD'
            },
            {
                id: 'technical1',
                module: 'technical/blockchainInfo'
            }
        ]
    });
};