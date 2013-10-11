module.exports = function (app) {
    app.configure({
        title: 'My Mining Operations',
        modules: [
            {
                id: 'miner1',
                name: 'Some Device Name',
                host: '127.0.0.1',
                port: 4028,
                interval: 2500
                module: 'miners/bfgminer',
                submodules: [
                    {
                        module: 'earnings/solo',
                        market: 'market1',
                        technical: 'technical1'
                    }
                ]
            },
            {
                id: 'market1',
                module: 'markets/bitcoincharts'
                symbol: 'mtgoxUSD'
            },
            {
                id: 'technical1',
                module: 'technical/blockchainInfo'
            }
        ]
    });
};