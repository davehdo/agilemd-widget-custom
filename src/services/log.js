/* jslint node: true */
'use strict';

var webcore = require('webcore');
var EVENTS = {
  ACTIVE: '472LmKyr',
  OPEN_FILE: 'eeXsp4DP',
  OPEN_MODULE: '46MuLEeG',
  OPEN_NODE: '5AGWYopX',
  XHR: '53PK1vZT'
};

var _ = require('lodash');
var B = require('backdash');
var xhr = require('./xhr');

var algorithms = require('../collections/algorithms');
var documents = require('../collections/documents');
var flowcharts = require('../collections/documents');
var modules = require('../collections/modules');
var notes = require('../collections/documents');
var pdfs = require('../collections/pdfs');

var vmNavigator = require('../viewmodels/navigator');
var vmFile = require('../viewmodels/index/file');


function _log (name, data) {
  var _parms = {};

  _parms.name = name;

  if (data) {
    _parms.data = data;
  }

  // temporary debug
  console.log('[metric:' + name + ']', data);
}

function _logXHR (data) {
  _log(EVENTS.XHR, data);
}

_log(EVENTS.ACTIVE);

vmNavigator.on('change:moduleId', function (model, mid) {
  if (mid && mid !== -1) {
    _log(EVENTS.OPEN_MODULE, {
      moduleId: mid
    });
  }
});

// open file events
vmFile.on('change:versionId', function (model) {
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

// api request events
algorithms.on('xhr', _logXHR);
documents.on('xhr', _logXHR);
flowcharts.on('xhr', _logXHR);
modules.on('xhr', _logXHR);
pdfs.on('xhr', _logXHR);
xhr.on('xhr', _logXHR);
