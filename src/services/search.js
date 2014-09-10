'use strict';

var _ = require('lodash');
var B = require('backdash');

var session = require('../models/session');
var uris = require('./uris');
var xhr = require('./xhr');

var service = _.extend({}, B.Events);


service.byId = function (entityId, resultsHandler, resultsContext) {
  if (resultsHandler && resultsContext) {
    resultsHandler = _.bind(resultsHandler, resultsContext);
  }

  var uri = uris('search', {
    clientId: session.get('clientId')
  });

  service.trigger('req', {
    type: 'id',
    value: entityId
  });

  xhr({
    beforeSend: session.inject,
    context: service,
    method: 'GET',
    uri: uri + '&id=' + entityId,
    success: function (res) {
      var results = res.results || [];

      if (_.isFunction(resultsHandler)) {
        resultsHandler(results);
      }

      this.trigger('res', results);
    },
    error: function (req, status, err) {
      if (_.isFunction(resultsHandler)) {
        resultsHandler([]);
      }

      this.trigger('err', err);
    }
  });
};


module.exports.byId = service.byId;
module.exports.on = service.on;
