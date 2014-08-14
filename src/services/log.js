/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var algorithms = require('../collections/algorithms');
var documents = require('../collections/documents');
var env = require('./env');
var modules = require('../collections/modules');
var session = require('../models/session');
var vmNavigator = require('../viewmodels/navigator');
var vmFile = require('../viewmodels/file');
var xhr = require('./xhr');

var EVENTS = {
  ACTIVE: '472LmKyr',
  OPEN_FILE: 'eeXsp4DP',
  OPEN_MODULE: '46MuLEeG',
  OPEN_NODE: '5AGWYopX',
  XHR: '53PK1vZT'
};
var URI = 'https://utilsqa.agilemd.com/m';

var service = _.extend({}, B.Events);
var emitterNoop = {trigger: function () {}};

var eventSchema = {};
(function () {
  var version = env('VERSION');

  eventSchema.a = {
    name: 'widget',
    m: version.M,
    n: version.m,
    p: version.p,
    '@': version.c
  };

  eventSchema.d = env('AGENT');
})();


function _log (name, context) {
  var data = _.extend({}, eventSchema);

  data.e = name;

  if (context) {
    data.x = context;
  }

  service.trigger('req', data);

  // record the log event; note that a noop emitter is used
  // to avoid an infinite loops of xhr log events
  xhr({
    contentType: 'application/json; charset=utf-8',
    beforeSend: session.inject,
    data: JSON.stringify({log: [data]}),
    dataType: 'json',
    emitter: emitterNoop,
    method: 'POST',
    uri: URI
  });
}

// proxy passed data into the generic log as an XHR event
function _logXHR (data) {
  _log(EVENTS.XHR, data);
}

session.on('change:ownerId', function (model, ownerId) {
  // ignore resets
  if (!ownerId) return;

  eventSchema.u = ownerId;

  // web-widget does not attempt to detect signal stregth
  _log(EVENTS.ACTIVE, {
    connection: 'unknown'
  });
});

vmNavigator.on('change:moduleId', function (model, mid) {
  // ignore resets
  if (!mid || mid === -1) return;

  _log(EVENTS.OPEN_MODULE, {
    moduleId: mid
  });
});

// open file events
vmFile.on('change:title', function (model, title) {
  // ignore resets
  if (!title) return;

  var moduleId = vmNavigator.get('moduleId');

  var data = {
    entityId: model.get('entityId'),
    versionId: model.get('versionId')
  };

  if (moduleId) {
    data.moduleId = moduleId;
  }

  _log(EVENTS.OPEN_FILE, data);
});

// data events
algorithms.on('xhr', _logXHR);
documents.on('xhr', _logXHR);
modules.on('xhr', _logXHR);
xhr.on('xhr', _logXHR);


module.exports = service.on;
