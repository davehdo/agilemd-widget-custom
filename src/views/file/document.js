/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var io = require('../../services/io');
var vmModal = require('../../viewmodels/modal');


var Document = B.View.extend({
  collection: require('../../collections/documents'),
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-moreinfo'] = 'uiClickInfo';
    out[action + ' h2'] = 'uiClickSection';

    return out;
  })(),
  template: require('../../templates/file/document.html'),
  viewmodel: require('../../viewmodels/file'),
  initialize: function () {
    _.bindAll(this);

    this.isRetina = env('IS_RETINA');

    this.viewmodel.on('change:versionId', function (vm, versionId) {
      var changed = vm.changedAttributes();

      // ignore transitions and non-document files
      if (vm.get('type') !== 'document') return;

      // if the versionId changed load the file;
      //      if content changed, request a rerender
      var doc = this.collection.get(changed.versionId);

        // if data available, prepare the view immediately
        // else, hydrate then prepare
      if (doc) {
        this.prepare(doc);
        return;
      }

      doc = this.collection.add({
        _id: changed.versionId,
        _entityId: vm.get('entityId')
      });

      doc.once('sync', function (newDoc) {
        this.prepare(newDoc);
      }, this);

      doc.hydrate();
    }, this);

    this.viewmodel.on('change:title', function (vm, title) {
      if (title && vm.get('type') === 'document') {
        this.trigger('render');
      }
    }, this);
  },
  prepare: function (doc) {
    this.viewmodel.set({
      attribution: doc.get('attribution'),
      content: doc.get('content'),
      infoTexts: doc.get('infoTexts'),
      textLang: doc.get('textLang'),
      textDir: doc.get('textDir'),
      title: doc.get('title')
    });
  },
  render: function () {
    var content = this.viewmodel.get('content');
    var textDir = this.viewmodel.get('textDir');
    var textLang = this.viewmodel.get('textLang');

    this.$el.html(this.template(content, textDir, textLang));

    this.trigger('rendered');
  },
  uiClickInfo: function (e) {
    var $info = B.$(e.target).closest('.aglmd-moreinfo');
    var iid = $info.data('iid');
    var infotext = this.viewmodel.get('infoTexts')[iid];

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
