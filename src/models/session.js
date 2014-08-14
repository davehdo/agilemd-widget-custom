/* jslint node: true */
'use strict';

var _ = require('lodash');

var env = require('../services/env');
var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');
var xhr = require('../services/xhr');


var Session = Model.extend({
  idAttribute: '_id',
  defaults: {
    clientId: '',
    ownerId: '',
    token: ''
  },
  initialize: function() {
    _.bindAll(this);
  },
  authenticate: function (config) {
    config = config || {};

    if (!config.key) {
      io.alert('cannot authenticate without a key parameter');
      return;
    }

    if (!config.email) {
      io.alert('cannot authenticate without an email parameter');
      return;
    }

    xhr({
      context: this,
      method: 'POST',
      dataType: 'json',
      uri: uris('tokens'),
      data: {
        email: config.email,
        key: config.key
      },
      success: function (data) {
        this.set(data);
      },
      error: function (req, status, err) {
        io.alert('unable to generate session; no network or bad token');
      }
    });
  },
  inject: function (xhr, settings) {
    var token = this.get('token') + ':';

    if (!token || token.length === 1) {
      io.crit('missing token; request may fail if authentication is required');
    }

    xhr.setRequestHeader('Authorization', ('Basic ' + btoa(token)));
  }
});


// this model is a singleton; immediately instantiate
var session = new Session();
module.exports = session;
