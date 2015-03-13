'use strict';

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Document = Model.extend({
  idAttribute: 'fileId',
  defaults: {
    fileId: null,
    attribution: null,
    title: null,
    url: null,
  },
  hydrate: function (fileId, moduleId) {
    this.url = uris('filePDF', {
      fileId: fileId,
      moduleId: moduleId
    });

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve pdf with fileId=' + fileId);
      }
    });
  },
  parse: function (raw) {
    raw = raw.file ? raw.file : raw;

    var parsed = {};

    parsed.fileId = raw.fileId;
    parsed.attribution = raw.meta.attribution;
    parsed.title = raw.meta.title;
    parsed.url = raw.data.url;

    return parsed;
  }
});


module.exports = Document;
