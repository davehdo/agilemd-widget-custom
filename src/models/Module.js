'use strict';

var _ = require('lodash');

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Module = Model.extend({
  idAttribute: 'moduleId',
  defaults: {
    art: '',
    description: '',
    files: {},
    folders: {},
    rootFolderId: '',
    subtitle: '',
    title: ''
  },
  initialize: function() {
    _.bindAll(this);
  },
  hydrate: function () {
    var moduleId = this.id;

    this.url = uris('module', {moduleId: moduleId});

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve module with moduleId=' + moduleId);
      }
    });
  },
  parse: function (raw) {
    raw = raw.module ? raw.module : raw;

    var parsed = {};

    parsed.art = raw.meta.art['128'];
    parsed.description = raw.meta.description;
    parsed.moduleId = raw.moduleId;
    parsed.subtitle = raw.meta.subtitle;
    parsed.title = raw.meta.title;

    parsed.rootFolderId = raw.data.rootFolderId;
    parsed.folders = raw.data.folders;
    parsed.files = _.reduce(raw.data.files, function (out, f) {
      out[f.fileId] = f;
      return out;
    }, {});

    // parse folder items into renderable iterable
    _.each(parsed.folders, function (folder, folderId) {
      folder._id = folderId;

      parsed.folders[folderId].items = _.map(folder.items, function (item) {
        if (item.itemType === 'folder') {
          item.title = parsed.folders[item.itemId].title;
          item.folderId = item.itemId;
          item.fileCount = parsed.folders[item.itemId].fileCount;
        }
        else {
          item.title = parsed.files[item.itemId].meta.title;
          item.fileId = item.itemId;
          item.moduleId = parsed.moduleId;
        }

        delete item.itemId;

        return item;
      });
    });

    return parsed;
  }
});


module.exports = Module;
