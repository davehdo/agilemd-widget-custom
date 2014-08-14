/* jslint node: true */
'use strict';

var HOST = 'https://apiqa.agilemd.com';
var RENDERER = 'widget';


var _uris = {
  module: {
    uri: function (context) {
      return '/v3/modules/' + context.moduleId;
    },
    renderer: '3.0'
  },
  modules: {
    uri: function (context) {
      return '/v3/users/' + context.clientId + '/modules';
    },
    renderer: '3.0'
  },
  fileAlgorithm: {
    uri: function (context) {
      return '/v3/algorithms/' + context.entityId + '/versions/' + context.versionId;
    },
    renderer: '3.0'
  },
  fileDocument: {
    uri: function (context) {
      return '/v3/documents/' + context.entityId + '/versions/' + context.versionId;
    },
    renderer: '3.0'
  },
  fileFlowchart: {
    uri: function (context) {
      return '/v3/flowcharts/' + context.entityId + '/versions/' + context.versionId;
    },
    renderer: '3.0'
  },
  filePDF: {
    uri: function (context) {
      return '/v3/pdfs/' + context.entityId + '/versions/' + context.versionId;
    },
    renderer: '3.0'
  },
  search: {
    uri: function (context) { return '/v3/users/' + context.clientId + '/search'; },
    renderer: '1.0'
  },
  tokens: {
    uri: function (context) {
      return '/v3/tokens';
    }
  }
};

function get (slug, context) {
  var endpoint = _uris[slug].uri(context);

  if (_uris[slug].renderer) {
    endpoint += '?r=' + RENDERER + '-' + _uris[slug].renderer;
  }

  return HOST + endpoint;
}


module.exports = get;
