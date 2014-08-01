/* jslint node: true */
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
  stub: function () {
    this.url = uris('modules', {
      clientId: session.get('clientId')
    });

    this.reset();
    this.fetch({
      beforeSend: session.inject,
      error: function (req, status, err) {
        io.alert('failed to retrieve modules');
      }
    });
  },
  parse: function (raw) {
    var parsed = raw.modules;

    return parsed;
  }
});


var modules = new Modules();
module.exports = modules;
