'use strict';

var hashrateHelper = require('../handlebars/helpers/hashrate'),
    renderHistoricalDataGraph = require('./mixins/renderHistoricalDataGraph'),

    View = require('../View'),
    graphMixin = renderHistoricalDataGraph([ {
        attr: 'currentHashrate',
        name: 'Total Hashrate'
    } ], '.graph', {
        yFormatter: function (value) {
            return hashrateHelper(value);
        }
    });

module.exports = View.extend({
    template: 'aggregatedMiners'
}).extend(graphMixin);