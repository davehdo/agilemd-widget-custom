'use strict';

var _ = require('lodash');

var Collection = require('./Collection');
var session = require('../models/session');


var Flowcharts = Collection.extend({
  model: require('../models/Flowchart'),
  initialize: function() {
    _.bindAll(this);

    session.on('change:token', function () {
      this.reset();
    }, this);
  }
});


var documents = new Flowcharts();
module.exports = documents;
