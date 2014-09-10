'use strict';

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Document = Model.extend({
  idAttribute: '_id',
  defaults: {
    _entityId: null,
    attribution: null,
    content: '',
    infoTexts: {},
    title: null,
    textDir: 'ltr',
    textLang: 'en'
  },
  hydrate: function () {
    var entityId = this.get('_entityId');

    this.url = uris('fileDocument', {
      entityId: entityId,
      versionId: this.id
    });

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve document with fileId=' + entityId);
      }
    });
  },
  parse: function (raw) {
    var parsed = raw.version;

    return parsed;
  }
});


module.exports = Document;
