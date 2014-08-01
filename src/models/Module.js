/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Module = Model.extend({
  idAttribute: '_id',
  defaults: {
    art: 'https://cdn.agilemd.com/assets/art/_default/hvpwt0fk.128.png',
    description: '',
    folders: {},
    subtitle: '',
    title: '',
    versions: {}
  },
  initialize: function() {
    _.bindAll(this);
  },
  hydrate: function () {
    this.url = uris('module', {moduleId: this.id});

    this.fetch({
      beforeSend: session.inject,
      error: function (req, status, err) {
        io.alert('failed to retrieve module with moduleId=' + this.id);
      }
    });
  },
  parse: function (raw) {
    var parsed = (raw.module) ? raw.module : raw;

    if (parsed.folders) {
      // sugar
      var folders = parsed.folders;
      var versions = parsed.versions;

      // parse folder items into renderable iterable
      _.each(folders, function (folder, folderId) {
        if (folderId !== '_rootId') {
          folder._id = folderId;

          folder.items = _.map(folder.items, function (item) {

            if (item.itemType === 'folder') {
              item.title = folders[item.itemId].title;
              item.folderId = item.itemId;
              item.fileCount = folders[item.itemId].fileCount;
            }
            else {
              item.title = versions[item.itemId].title;
              item.versionId = item.itemId;
              item.entityId = versions[item.itemId].entityId;
            }

            delete item.itemId;
            return item;
          });
        }
      });
    }

    return parsed;
  }
});


module.exports = Module;
