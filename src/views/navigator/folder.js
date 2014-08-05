/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var io = require('../../services/io');
var vmFile = require('../../viewmodels/file');


var Folder = B.View.extend({
  collection: require('../../collections/modules'),
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-folder-items li'] = 'uiOpenFolderItem';

    return out;
  })(),
  template: require('../../templates/navigator/folder.html'),
  viewmodel: require('../../viewmodels/navigator'),
  initialize: function () {
    _.bindAll(this);

    // listen for state-control changes
    this.viewmodel.on('change:moduleId', function (vm, moduleId) {
      // load the default module for this integration
      if (moduleId === -1) {
        if (this.collection.length) {
          this.loadDefault();
          return;
        }

        this.collection.once('sync', function () {
          this.loadDefault();
        }, this);

        this.collection.stub();
      }
      // load a specific module
      else if (moduleId) {
        var module = this.collection.get(moduleId);

        // if the module is missing OR has not been hydrated, load it
        if (!module || !module.get('folders')._rootId) {
          module = this.collection.add({
            _id: moduleId
          });

          module.on('sync', function (newModule) {
            this.prepare(newModule);
          }, this);

          module.hydrate();
          return;
        }

        this.prepare(module);
      }
    }, this);

    // listen for renderable changes
    this.viewmodel.on('change:folders', function (vm, folders) {
      // rerender the last folder in the folder path stack
      if (folders && folders.length) {
        // ensure that the file viewmodel is in a neutral state
        vmFile.transition();

        this.trigger('render');
      }
    }, this);
  },
  loadDefault: function () {
    var firstModule = this.collection.first();

    if (!firstModule) {
      io.alert('no default module could be found');
      return;
    }

    this.viewmodel.set('moduleId', firstModule.id);
  },
  prepare: function (module) {
    var folders = module.get('folders');

    this.viewmodel.set({
      moduleId: module.id,
      folders: [folders[folders._rootId]],
      title: module.get('title'),
    });
  },
  render: function () {
    var folder = this.viewmodel.get('folders').slice().pop();

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
      var module = this.collection.get(this.viewmodel.get('moduleId'));
      var folders = module.get('folders');

      var folderId = $item.data('fid');
      var parentId = $folder.data('fid');

      var path = this.viewmodel.get('folders').slice();

      var currentPathIndex = _.findIndex(path, function (folder) {
        return folder._id === parentId;
      });

      path = path.slice(0, currentPathIndex + 1);
      path.push(folders[folderId]);

      this.viewmodel.set('folders', path);
    } else {
      vmFile.transition({
        type: type,
        entityId: $item.attr('data-eid'),
        versionId: $item.attr('data-vid')
      });
    }
  }
});


module.exports = Folder;
