'use strict';

var Handlebars = require('handlebars');

Handlebars.registerHelper('hashrate', require('./helpers/hashrate'));
Handlebars.registerHelper('number', require('./helpers/number'));

module.exports = Handlebars;