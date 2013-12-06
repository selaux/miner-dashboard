'use strict';

var Handlebars = require('handlebars');

Handlebars.registerHelper('hashrate', require('./helpers/hashrate'));
Handlebars.registerHelper('number', require('./helpers/number'));
Handlebars.registerHelper('time', require('./helpers/time'));
Handlebars.registerHelper('timespan', require('./helpers/timespan'));

module.exports = Handlebars;