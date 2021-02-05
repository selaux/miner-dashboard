'use strict';

var _ = require('lodash'),
    hashrateHelper = require('../handlebars/helpers/hashrate'),
    renderHistoricalDataGraph = require('./mixins/renderHistoricalDataGraph'),

    View = require('../View');

module.exports = View.extend({
    postRender: function () {
        var self = this,
            colors = [ '#cae2f7', '#a7d2f7' ],
            series,
            graphMixin;

        if (self.graph === undefined) {
            series = _(self.module.get('historicalData'))
                .map(function (val) {
                    return _(val)
                        .keys()
                        .filter(function (key) { return key.split('.')[0] === 'currentHashrate'; })
                        .map(function (key) { return key.split('.').slice(1).join('.'); })
                        .value();
                })
                .flatten()
                .uniq()
                .map(function (minerId, it) {
                    return {
                        attr: 'currentHashrate.' + minerId,
                        name: self.module.get('minerTitles')[minerId],
                        color: colors[it % colors.length]
                    };
                })
                .value();
            graphMixin = renderHistoricalDataGraph(series, '.graph', {
                stack: true
            }, {
                yFormatter: function (value) {
                    return hashrateHelper(value);
                }
            });

            _.extend(this, graphMixin);
            this.postRender();
        }
    },

    template: 'aggregatedMiners'
});