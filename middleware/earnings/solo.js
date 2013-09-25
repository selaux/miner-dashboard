'use strict';

module.exports = function (data, callback) {
    var earningsPerDay = data.technical.btcPerBlock * (24 * 60 * 60) * data.miner.avgHashrate * 1e6 * data.technical.probability * data.market.ask;
    data.earnings = {
        value: earningsPerDay,
        currency: data.market.currency,
        interval: 'Day'
    };
    callback(null);
};