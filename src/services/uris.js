'use strict';

var HOST = 'https://api.agilemd.com';


var uris = {
  module: {
    uri: function (context) {
      return '/v3/modules/' + context.moduleId;
    },
    view: 'native-7.0'
  },
  modules: {
    uri: function (context) {
      return '/v3/users/' + context.clientId + '/modules';
    },
    view: 'native-7.0'
  },
  fileAlgorithm: {
    uri: function (context) {
      return '/v3/modules/' + context.moduleId + '/algorithms/' + context.fileId;
    },
    view: 'native-7.0'
  },
  fileDocument: {
    uri: function (context) {
      return '/v3/modules/' + context.moduleId + '/documents/' + context.fileId;
    },
    view: 'native-8.0'
  },
  fileFlowchart: {
    uri: function (context) {
      return '/v3/modules/' + context.moduleId + '/flowcharts/' + context.fileId;
    },
    view: 'native-2.0'
  },
  filePDF: {
    uri: function (context) {
      return '/v3/modules/' + context.moduleId + '/pdfs/' + context.fileId;
    },
    view: 'native-6.0'
  },
  tokens: {
    uri: function () {
      return '/v3/tokens';
    }
  }
};

function get (slug, context) {
  var endpoint = uris[slug].uri(context);

  if (uris[slug].view) {
    endpoint += '?v=' + uris[slug].view;
  }

  return HOST + endpoint;
}


module.exports = get;
