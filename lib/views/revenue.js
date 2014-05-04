'use strict';

var renderHistoricalDataGraph = require('./mixins/renderHistoricalDataGraph'),

    View = require('../View'),
    graphMixin = renderHistoricalDataGraph([ {
        attr: 'value',
        name: 'Revenue'
    } ], '.graph', {
        yFormatter: function (value) {
            return value.toFixed(5) + ' ' + this.module.get('currency');
        }
    });

module.exports = View.extend({
    template: 'revenue'
}).extend(graphMixin);