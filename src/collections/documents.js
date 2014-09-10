'use strict';

var _ = require('lodash');

var Collection = require('./Collection');
var session = require('../models/session');


var Documents = Collection.extend({
  model: require('../models/Document'),
  initialize: function() {
    _.bindAll(this);

    session.on('change:token', function () {
      this.reset();
    }, this);
  }
});


var documents = new Documents();
module.exports = documents;
