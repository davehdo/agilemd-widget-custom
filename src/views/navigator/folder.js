'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var vmFile = require('../../viewmodels/file');


var Folder = B.View.extend({
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-folder-items li'] = 'uiOpenFolderItem';

    return out;
  })(),
  model: require('../../viewmodels/navigator'),
  template: require('../../templates/navigator/folder.html'),
  initialize: function () {
    _.bindAll(this);

    // listen for renderable changes
    this.model.on('change:path', function (vm, path) {
      // rerender the last folder in the folder path stack
      if (path && path.length) {
        // ensure that the file viewmodel is in a neutral state
        vmFile.transition();

        this.trigger('render');
      }
    }, this);
  },
  render: function () {
    var folder = this.model.get('path').slice().pop();

    this.$el.html(this.template(folder));
    this.trigger('rendered');

    return this;
  },
  uiOpenFolderItem: function (e) {
    var $tgt = B.$(e.target);
    var $folder = $tgt.closest('.aglmd-folder');
    var $item = $tgt.closest('.aglmd-folder-item');
    var type = $item.data('type');

    if (type === 'folder') {
      var folders = this.model.get('folders');
      var path = this.model.get('path').slice();

      var folderId = $item.data('fid');
      var parentId = $folder.data('fid');

      var currentPathIndex = _.findLastIndex(path, function (folder) {
        return folder._id === parentId;
      });

      path = path.slice(0, currentPathIndex + 1);
      path.push(folders[folderId]);

      this.model.set('path', path);
      return;
    }

    this.$el.empty();

    vmFile.transition({
      type: type,
      fileId: $item.attr('data-fid'),
      moduleId: $item.attr('data-mid')
    });
  }
});


module.exports = Folder;
