'use strict';

var _ = require('lodash'),
    numberHelper = require('../handlebars/helpers/number'),
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
                        .filter(function (key) { return key.split('.')[0] === 'revenue'; })
                        .map(function (key) { return key.split('.').slice(1).join('.'); })
                        .value();
                })
                .flatten()
                .uniq()
                .map(function (minerId, it) {
                    return {
                        attr: 'revenue.' + minerId,
                        name: self.module.get('minerTitles')[minerId],
                        color: colors[it % colors.length]
                    };
                })
                .value();
            graphMixin = renderHistoricalDataGraph(series, '.graph', {
                stack: true
            }, {
                yFormatter: function (value) {
                    return numberHelper(value);
                }
            });

            _.extend(this, graphMixin);
            this.postRender();
        }
    },

    template: 'revenue'
});