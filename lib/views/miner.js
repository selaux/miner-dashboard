'use strict';

var renderHistoricalDataGraph = require('./mixins/renderHistoricalDataGraph'),
    hashrateHelper = require('../handlebars/helpers/hashrate'),
    View = require('../View'),
    graphMixin = renderHistoricalDataGraph([ {
        attr: 'currentHashrate',
        name: 'Hashrate'
    } ], '.graph', {}, {
        yFormatter: function (value) {
            return hashrateHelper(value);
        }
    });

module.exports = View.extend({
    template: 'miner'
}).extend(graphMixin);