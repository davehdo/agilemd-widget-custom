'use strict';

var _ = require('lodash');
var B = require('backdash');

var service = _.extend({}, B.Events);


// abstract away questionable jQuery parameter names
service.xhr = function (parms) {
  var _complete;
  var _emitter = parms.emitter || service;
  var _tsStart = +new Date();

  var req = parms;

  if (parms.complete) {
    _complete = parms.complete;
  }

  if (parms.emitter) {
    delete parms.emitter;
  }

  if (parms.method) {
    req.type = parms.method;
    delete req.method;
  }

  if (parms.uri) {
    req.url = parms.uri;
    delete req.uri;
  }

  req.complete = function (_xhr) {
    var _tsEnd = +new Date();

    _emitter.trigger('xhr', {
      latency: _tsEnd - _tsStart,
      status: _xhr.status,
      uri: req.url
    });

    if (_complete) {
      _complete(arguments);
    }
  };

  B.$.ajax(req);
};


module.exports = service.xhr;
module.exports.on = service.on;
