/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var vmModal = require('../../viewmodels/modal');


var Document = B.View.extend({
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-moreinfo'] = 'uiClickInfo';
    out[action + ' h2'] = 'uiClickSection';

    return out;
  })(),
  model: require('../../viewmodels/file'),
  template: require('../../templates/file/document.html'),
  initialize: function () {
    _.bindAll(this);

    this.isRetina = env('IS_RETINA');

    this.model.on('change:content', function (vm, content) {
      if (content && vm.get('type') === 'document') {
        this.trigger('render');
      }
    }, this);
  },
  render: function () {
    var content = this.model.get('content');
    var textDir = this.model.get('textDir');
    var textLang = this.model.get('textLang');

    this.$el.html(this.template(content, textDir, textLang));
    this.$el.find('.aglmd-section').first().toggleClass('aglmd-active', true);

    this.trigger('rendered');
  },
  uiClickInfo: function (e) {
    var $info = B.$(e.target).closest('.aglmd-moreinfo');
    var iid = $info.data('iid');
    var infotext = this.model.get('infoTexts')[iid];

    vmModal.transition({
      title: $info.text(),
      content: infotext,
      top: env('IS_FIXED_SIZE') ? 0 : $info.offset().top
    });
  },
  uiClickSection: function (e) {
    var $h2 = B.$(e.target).closest('h2');

    $h2.toggleClass('aglmd-active');
    $h2.next('.aglmd-section').toggleClass('aglmd-active');
  }
});


module.exports = Document;
