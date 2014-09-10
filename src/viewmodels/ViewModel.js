'use strict';

var _ = require('lodash');
var B = require('backdash');


var ViewModel = B.Model.extend({
  transition: function (toState) {
    toState = toState || {};

    // [KE] this is useful for state transitions which might
    //      otherwise silently transition on object equality check
    toState = _.extend(_.clone(this.defaults), toState);

    this.clear().set(toState);
  }
});


module.exports = ViewModel;
