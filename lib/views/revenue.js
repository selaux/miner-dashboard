'use strict';

var Rickshaw = require('rickshaw'),
    _ = require('lodash'),
    timeHelper = require('../handlebars/helpers/time'),

    View = require('../View');

module.exports = View.extend({
    template: 'revenue',

    graph: null,

    getChartData: function () {
        return this.module.get('historicalData').map(function (measurement) {
            return {
                x: (measurement.timestamp / 1000),
                y: measurement.value
            };
        });
    },

    initializeGraph: function () {
        var module = this.module;

        this.graph = new Rickshaw.Graph({
            element: this.$('.graph')[0],
            height: 120,
            renderer: 'area',
            interpolation: 'linear',
            stroke: true,
            series: [
                {
                    color: '#cae2f7',
                    name: 'Revenue',
                    data: this.getChartData()
                }
            ]
        });
        this.detail = new Rickshaw.Graph.HoverDetail({
            graph: this.graph,
            yFormatter: function (value) {
                return value.toFixed(5) + ' ' + module.get('currency');
            },
            xFormatter: function (value) {
                return timeHelper(value * 1000);
            }
        });
        this.xAxis = new Rickshaw.Graph.Axis.Time({
            graph: this.graph
        });
        this.yAxis = new Rickshaw.Graph.Axis.Y({
            graph: this.graph
        });
    },

    updateGraph: function () {
        var chartData = this.getChartData();

        this.graph.min = _(chartData).pluck('y').min().value() * 0.99;
        this.graph.max = _(chartData).pluck('y').max().value() * 1.01;
        this.graph.series[0].data = this.getChartData();

        this.xAxis.render();
        this.yAxis.render();
        this.graph.update();
    },

    postRender: function () {
        var graphElement = this.$('.graph'),
            graphShouldBeRendered = graphElement.length > 0 && this.module.get('historicalData');

        if (graphShouldBeRendered) {
            if (this.graph) {
                graphElement.replaceWith(this.graph.element);
            } else {
                this.initializeGraph();
            }
            this.updateGraph();
        }
    }
});