'use strict';

var _ = require('lodash');
var ViewModel = require('./ViewModel');


var ViewModel = ViewModel.extend({
  defaults: {
    title: null,
    content: null
  },
  initialize: function() {
    _.bindAll(this);
  }
});


module.exports = new ViewModel();
