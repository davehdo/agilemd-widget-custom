/* jslint node: true */
'use strict';

var _ = require('lodash');

var Collection = require('./Collection');
var session = require('../models/session');


var Algorithms = Collection.extend({
  model: require('../models/Algorithm'),
  initialize: function() {
    _.bindAll(this);

    session.on('change:token', function () {
      this.reset();
    }, this);
  }
});


var algorithms = new Algorithms();
module.exports = algorithms;
