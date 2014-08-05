/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');
var ViewModel = require('./ViewModel');


var ViewModel = ViewModel.extend({
  defaults: {
    // persistant top navigator
    isDisabled: false,
    topArt: null,
    topTitle: null,
    topSubtitle: null,
    // folder browser
    moduleId: null,
    folders: []
  },
  initialize: function() {
    _.bindAll(this);
  },
  transition: function (toState) {
    toState = toState || {};

    // the isDisabled property must be explicitly set; lazy transitioning
    // is not allowed
    toState.isDisabled = this.get('isDisabled');
    toState = _.extend(_.clone(this.defaults), toState);

    this.clear().set(toState);
  }
});


module.exports = new ViewModel();
