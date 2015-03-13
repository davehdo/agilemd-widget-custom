'use strict';

var _ = require('lodash');

var Collection = require('./Collection');
var session = require('../models/session');


var PDFs = Collection.extend({
  model: require('../models/PDF'),
  initialize: function() {
    _.bindAll(this);

    session.on('change:token', function () {
      this.reset();
    }, this);
  }
});


var pdfs = new PDFs();
module.exports = pdfs;