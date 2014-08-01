/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../services/env');


var Modal = B.View.extend({
  collection: require('../collections/modules'),
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-modal-close'] = 'uiClose';

    return out;
  })(),
  template: require('../templates/modal.html'),
  viewmodel: require('../viewmodels/modal'),
  initialize: function () {
    _.bindAll(this);

    // listen for state-control changes
    this.viewmodel.on('change', function (model) {
      var changed = model.changedAttributes();

      if (changed.title || changed.content) {
        this.trigger('render');
      }
    }, this);
  },
  render: function () {
    this.$el.html(this.template(
      this.viewmodel.get('title'),
      this.viewmodel.get('content')
    ));

    var $content = this.$el.children('.aglmd-modal-content');
    var height = $content.height();
    var max = B.$('#agilemd').height();
    var top = this.viewmodel.get('top');

    this.$el.css('top', Math.round(Math.min(top, max - height)) || '');

    this.trigger('rendered');

    return this;
  },
  uiClose: function (e) {
    this.trigger('unrender');
  }
});


module.exports = Modal;
