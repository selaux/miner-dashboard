'use strict';

var Handlebars = require('handlebars');

Handlebars.registerHelper('hashrate', require('./helpers/hashrate'));

module.exports = Handlebars;