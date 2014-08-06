/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var vmFile = require('../../viewmodels/file');


var Top = B.View.extend({
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-navigation-back'] = 'uiBack';
    out[action + ' .aglmd-navigation-art'] = 'uiToModule';

    return out;
  })(),
  model: require('../../viewmodels/navigator'),
  template: require('../../templates/navigator/top.html'),
  initialize: function () {
    _.bindAll(this);

    // listen for renderable changes
    this.model.on('change', function (vm) {
      var changed = vm.changedAttributes();
      var viewstate = {};

      if (changed.path && changed.path.length) {
        if (changed.path.length === 1) {
          viewstate.topTitle = this.model.get('title');
          viewstate.topSubtitle = this.model.get('subtitle');
        }
        else if (changed.path.length > 1) {
          var path = changed.path.slice(0);

          viewstate.topTitle = path.pop().title;
          viewstate.topSubtitle = _.pluck(path, 'title').join(' > ');
        }
      }

      this.model.set(viewstate, {
        silent: true
      });

      this.render();
    }, this);

    // listen for renderable changes
    this.model.on('change:isDisabled', function (vm, isDisabled) {
      if (isDisabled) {
        this.disable();
      }
    }, this);

    vmFile.on('change:title', function (vm, title) {
      if (title) {
        this.model.set({
          topTitle: title,
          topSubtitle: vm.get('attribution')
        });
      }
    }, this);
  },
  disable: function () {
    this.trigger('disabled');

    this.$el.toggleClass('aglmd-hide', true);
  },
  render: function () {
    if (this.model.get('isDisabled')) return;

    var art = this.model.get('art');
    var path = this.model.get('path');
    var title = this.model.get('topTitle');
    var subtitle = this.model.get('topSubtitle');
    var useBack = (
      (path && path.length > 1) ||
      (path && vmFile.get('entityId'))
    );

    if (!art && !title && !subtitle && !useBack) {
      this.$el.empty();
      return;
    }

    if (subtitle && !title) {
      title = subtitle;
      subtitle = null;
    }

    // alter the layout of the view based on the structure of nav data
    this.$el.toggleClass('aglmd-has-art', !!art && art.length);
    this.$el.toggleClass('aglmd-has-back', useBack);
    this.$el.toggleClass('aglmd-has-subtitle', !!subtitle && subtitle.length);

    this.$el.html(this.template(useBack, art, title, subtitle));
  },
  uiBack: function (e) {
    var path = this.model.get('path').slice();
    var currentFolder = path[path.length-1];
    var activeEntityId = vmFile.get('entityId');

    // if the active file is in the current path, the transition
    //    must be from viewing a file back to the folder it contained
    // else, pop the folder stack
    if (!_.any(currentFolder.items, function (item) {
      return item.entityId === activeEntityId;
    })) {
      path.pop();
    }

    this.model.unset('path', {silent: true});
    this.model.set('path', path);
  },
  uiToModule: function (e) {
    this.model.transition({
      moduleId: this.model.get('moduleId')
    });
  }
});


module.exports = Top;
