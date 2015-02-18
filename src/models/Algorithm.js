'use strict';

var _ = require('lodash');

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Algorithm = Model.extend({
  idAttribute: 'fileId',
  defaults: {
    fileId: null,
    attribution: null,
    nodes: {},
    rootNodeId: null,
    title: null
  },
  hydrate: function (fileId, moduleId) {
    this.url = uris('fileAlgorithm', {
      fileId: fileId,
      moduleId: moduleId
    });

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve algorithm with fileId=' + fileId);
      }
    });
  },
  parse: function (raw) {
    raw = raw.file ? raw.file : raw;

    var parsed = {};

    parsed.fileId = raw.fileId;

    parsed.attribution = raw.meta.attribution;
    parsed.title = raw.meta.title;

    parsed.rootNodeId = raw.data.rootNodeId;
    parsed.nodes = _.reduce(raw.data.nodes, function (out, node, nodeId) {
      out[nodeId] = node;
      out[nodeId]._id = nodeId;

      return out;
    }, {});

    return parsed;
  }
});


module.exports = Algorithm;
