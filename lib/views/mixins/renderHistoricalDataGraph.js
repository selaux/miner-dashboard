'use strict';

var Rickshaw,
    _ = require('lodash'),
    $ = require(typeof window !== 'undefined' ? 'jquery' : 'cheerio'),
    timeHelper = require('../../handlebars/helpers/time');

if (typeof window !== 'undefined') {
    // only require rickshaw client-side
    Rickshaw = require('rickshaw');
}

function getValueRange(series, stacked) {
    var values = _.map(series, function (ser) {
        return _.map(ser.data, 'y');
    });

    if (stacked) {
        values = _.map(_.zip(values), function (ser) {
            return _.reduce(ser, function (a, b) { return a + b; }, 0);
        });
    } else {
        values = _.flatten(values);
    }

    return values;
}

module.exports = function (attributes, element, graphOptions, hoverOptions) {
    return {
        graph: null,

        getSeries: function () {
            var self = this;

            return _(attributes).filter(function (attr) {
                return _.any(self.module.get('historicalData'), function (measurement) {
                    return measurement[attr.attr] !== undefined;
                });
            }).map(function (attr) {
                return _.extend({
                    color: '#cae2f7',
                    data: self.module.get('historicalData').map(function (measurement) {
                        return {
                            x: (measurement.timestamp / 1000),
                            y: measurement[attr.attr]
                        };
                    })
                }, attr);
            }).value();
        },

        initializeGraph: function () {
            var graphElement = this.$(element)[0];

            if (hoverOptions.xFormatter) {
                hoverOptions.xFormatter = hoverOptions.xFormatter.bind(this);
            }
            if (hoverOptions.yFormatter) {
                hoverOptions.yFormatter = hoverOptions.yFormatter.bind(this);
            }

            this.graph = new Rickshaw.Graph(_.extend({
                element: graphElement,
                renderer: 'area',
                interpolation: 'linear',
                stroke: true,
                stack: false,
                series: this.getSeries()
            }, graphOptions));
            this.detail = new Rickshaw.Graph.HoverDetail(_.extend({
                graph: this.graph,
                xFormatter: function (value) {
                    return timeHelper(value * 1000);
                }.bind(this),
                onRender: function () {
                    var detailElement = $(this.element);
                    if (detailElement.find('.item.active').position().top < $(graphElement).height() / 4 ) {
                        detailElement.find('.x_label').addClass('bottom');
                    } else {
                        detailElement.find('.x_label').removeClass('bottom');
                    }
                }
            }, hoverOptions));
            this.xAxis = new Rickshaw.Graph.Axis.Time({
                graph: this.graph,
                timeFixture: new Rickshaw.Fixtures.Time.Local()
            });
            this.yAxis = new Rickshaw.Graph.Axis.Y({
                graph: this.graph
            });
        },

        updateGraph: function () {
            var series = this.getSeries(),
                min = this.graph.config.stack ? 0 : _.min(getValueRange(series, this.graph.config.stack)),
                max = _.max(getValueRange(series, this.graph.config.stack));

            this.graph.min = min * 0.99;
            this.graph.max = max * (this.graph.config.stack ? 1.3 : 1.01);
            _.each(this.graph.series, function (graphSeries, index) {
                graphSeries.data = series[index].data;
            });

            this.xAxis.render();
            this.yAxis.render();
            this.graph.update();
        },

        postRender: function () {
            var graphElement = this.$(element),
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
    };
};