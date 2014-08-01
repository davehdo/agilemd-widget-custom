/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');
var ViewModel = require('./ViewModel');


var ViewModel = ViewModel.extend({
  defaults: {
    // persistant top navigator
    topArt: null,
    topTitle: null,
    topSubtitle: null,
    // folder browser
    moduleId: null,
    folders: []
  },
  initialize: function() {
    _.bindAll(this);
  }
});


module.exports = new ViewModel();
