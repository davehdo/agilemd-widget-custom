'use strict';

var _ = require('lodash');

var Collection = require('./Collection');
var io = require('../services/io');
var session = require('../models/session');
var uris = require('../services/uris');


var Modules = Collection.extend({
  model: require('../models/Module'),
  initialize: function () {
    _.bindAll(this);
  },
  hydrate: function () {
    this.url = uris('modules', {
      clientId: session.get('clientId')
    });

    this.reset();

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve modules');
      }
    });
  },
  parse: function (raw) {
    raw = raw.modules ? raw.modules : raw;

    // [KE] personal modules should not be displayed via widget
    var parsed = _.filter(raw, function (m) {
      return !m.module.meta.isPersonal;
    });

    return parsed;
  }
});


var modules = new Modules();
module.exports = modules;
