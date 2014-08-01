/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var vmFile = require('../../viewmodels/file');


var Top = B.View.extend({
  collection: require('../../collections/modules'),
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-navigation-back'] = 'uiBack';
    out[action + ' .aglmd-navigation-art'] = 'uiToModule';

    return out;
  })(),
  template: require('../../templates/navigator/top.html'),
  viewmodel: require('../../viewmodels/navigator'),
  initialize: function () {
    _.bindAll(this);

    // listen for renderable changes
    this.viewmodel.on('change', function (vm) {
      var changed = vm.changedAttributes();

      // ignore transition resets
      if (!vm.get('moduleId')) return;

      if (changed && changed.folders) {
        var module = this.collection.get(vm.get('moduleId'));

        // ignore transient changes to viewed module
        if (!module) return;

        if (changed.folders.length === 1) {
          this.viewmodel.set({
            topArt: module.get('art'),
            topTitle: module.get('title'),
            topSubtitle: module.get('subtitle')
          }, {
            silent: true
          });
        }
        else if (changed.folders.length > 1) {
          var folders = changed.folders.slice(0);

          this.viewmodel.set({
            topArt: module.get('art'),
            topTitle: folders.pop().title,
            topSubtitle: _.pluck(folders, 'title').join(' > ')
          }, {
            silent: true
          });
        }
      }

      this.render();
    }, this);

    vmFile.on('change:title', function (vm, title) {
      if (title) {
        this.viewmodel.set({
          topArt: null,
          topTitle: title,
          topSubtitle: vm.get('attribution')
        });
      }
    }, this);
  },
  render: function () {
    var art = this.viewmodel.get('topArt');
    var folders = this.viewmodel.get('folders');
    var title = this.viewmodel.get('topTitle');
    var subtitle = this.viewmodel.get('topSubtitle');
    var useBack = (
      (folders && folders.length > 1) ||
      (folders && vmFile.get('entityId'))
    );

    if (subtitle && !title) {
      title = subtitle;
      subtitle = null;
    }

    // alter the layout of the view based on the structure of nav data
    this.$el.toggleClass('aglmd-has-art', !!art && art.length);
    this.$el.toggleClass('aglmd-has-back', useBack);
    this.$el.toggleClass('aglmd-has-subtitle', !!subtitle && subtitle.length);

    if (!art && !title && !subtitle && !useBack) {
      this.$el.empty();
    } else {
      this.$el.html(this.template(useBack, art, title, subtitle));
    }
  },
  uiBack: function (e) {
    var folders = this.viewmodel.get('folders').slice();
    var currentFolder = folders[folders.length-1];
    var activeEntityId = vmFile.get('entityId');

    // if the active file is in the current folder, the transition
    //    must be from viewing a file back to the folder it contained
    // else, pop the folder stack
    if (!_.any(currentFolder.items, function (item) {
      return item.entityId === activeEntityId;
    })) {
      folders.pop();
    }

    this.viewmodel.unset('folders', {silent: true});
    this.viewmodel.set('folders', folders);
  },
  uiToModule: function (e) {
    this.viewmodel.transition({
      moduleId: this.viewmodel.get('moduleId')
    });
  }
});


module.exports = Top;
