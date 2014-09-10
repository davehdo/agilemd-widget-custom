'use strict';

var _ = require('lodash');

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Algorithm = Model.extend({
  idAttribute: '_id',
  defaults: {
    _entityId: null,
    attribution: null,
    nodes: {},
    rootNodeId: null,
    title: null
  },
  hydrate: function () {
    var entityId = this.get('_entityId');

    this.url = uris('fileAlgorithm', {
      entityId: entityId,
      versionId: this.id
    });

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve algorithm with fileId=' + entityId);
      }
    });
  },
  parse: function (raw) {
    var parsed = raw.version;

    parsed.rootNodeId = parsed.nodes._rootId;
    delete parsed.nodes._rootId;

    // add an internal property for the keyed node id
    _.forEach(parsed.nodes, function (node, nodeId) {
      node._id = nodeId;
    });

    return parsed;
  }
});


module.exports = Algorithm;
