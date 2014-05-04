'use strict';

var renderHistoricalDataGraph = require('./mixins/renderHistoricalDataGraph'),
    View = require('../View'),
    numberHelper = require('../handlebars/helpers/number'),
    graphMixin = renderHistoricalDataGraph([
        {
            attr: 'bid',
            color: '#b94a48',
            name: 'Best Bid'
        },
        {
            attr: 'ask',
            color: '#468847',
            name: 'Best Ask'
        },
        {
            attr: 'close',
            name: 'Latest Trade'
        }
    ], '.graph', {
        yFormatter: function (value) {
            return numberHelper(value) + ' ' + this.module.get('currency');
        }
    }, {
        renderer: 'line'
    });;

module.exports = View.extend({
    template: 'market'
}).extend(graphMixin);