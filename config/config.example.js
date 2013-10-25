'use strict';

module.exports = {
    title: 'My Mining Operations',
    webinterface: {
        port: 3000
    },
    modules: [
        {
            module: 'earnings/solo',
            miner: 'miner1',
            market: 'market1',
            technical: 'technical1'
        },
        {
            id: 'miner1',
            module: 'miners/bfgminer',
            name: 'Some Device Name'
        },
        {
            id: 'market1',
            module: 'markets/bitcoincharts'
        },
        {
            id: 'technical1',
            module: 'technical/blockchainInfo'
        }
    ]
};