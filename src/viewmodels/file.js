'use strict';

var _ = require('lodash');
var ViewModel = require('./ViewModel');

var io = require('../services/io');

var modules = require('../collections/modules');
var algorithms = require('../collections/algorithms');
var documents = require('../collections/documents');
var flowcharts = require('../collections/flowcharts');
var pdfs = require('../collections/pdfs');

var vmNavigator = require('./navigator');

var File = ViewModel.extend({
  defaults: {
    title: null,
    type: null,
    fileId: null,
    moduleId: null
  },
  initialize: function() {
    _.bindAll(this);

    this.on('change:fileId', this.loadFile);
  },
  loadFile: function () {
    var fileId = this.get('fileId');
    var moduleId = this.get('moduleId');
    var type = this.get('type');

    if (fileId && moduleId && type) {
      var collection;
      var prepare;

      if (type === 'document') {
        collection = documents;
        prepare = this.prepareDocument;
      }
      else if (type === 'flowchart') {
        collection = flowcharts;
        prepare = this.prepareFlowchart;
      }
      else if (type === 'algorithm') {
        collection = algorithms;
        prepare = this.prepareAlgorithm;
      }
      else if (type === 'pdf') {
        collection = pdfs;
        prepare = this.preparePDF;
      }
      else {
        var msg = 'cannot get data for unknown file type fileId=' + fileId;
        io.error(msg);
        return;
      }

      // get the file...
      var file = collection.get(fileId);

      // if the file exists, prepare the view model immediately
      // else, hydrate then prepare
      if (file) {
        prepare(file);
        return;
      }

      file = collection.add({
        fileId: fileId
      });

      file.once('sync', function (remoteFile) {
        prepare(remoteFile);
      });

      file.hydrate(fileId, moduleId);
    }
    else if (fileId && !moduleId && !type) {
      if (modules.length) {
        return this.findAndLoadFile(fileId);
      }

      modules.once('sync', function () {
        this.findAndLoadFile(fileId);
      }, this);

      modules.hydrate();
    }
  },
  findAndLoadFile: function (fileId) {
    var fileType;
    var moduleArt;
    var moduleId;

    modules.each(function (module) {
      var files = module.get('files');

      if (_.has(files, fileId)) {
        fileType = files[fileId].fileType;
        moduleArt = module.get('art');
        moduleId = module.id;
        return false;
      }
    });

    if (!moduleId) {
      io.error('unable to locate valid file for fileId=' + fileId);
      return;
    }

    vmNavigator.set({
      art: moduleArt,
      moduleId: moduleId
    }, {silent: true});

    this.transition({
      type: fileType,
      fileId: fileId,
      moduleId: moduleId
    });
  },
  prepareAlgorithm: function (file) {
    this.set({
      attribution: file.get('attribution'),
      nodeIds: [file.get('rootNodeId')],
      nodes: file.get('nodes'),
      title: file.get('title')
    });
  },
  prepareDocument: function (file) {
    this.set({
      attribution: file.get('attribution'),
      content: file.get('content') || '',
      infoTexts: file.get('infoTexts'),
      textLang: file.get('textLang'),
      textDir: file.get('textDir'),
      title: file.get('title')
    });
  },
  prepareFlowchart: function (file) {
    this.set({
      attribution: file.get('attribution'),
      chart: file.get('chart'),
      chartStyle: file.get('chartStyle') || '',
      content: file.get('content'),
      title: file.get('title')
    });
  },
  preparePDF: function (file) {
    this.set({
      attribution: file.get('attribution'),
      title: file.get('title'),
      url: file.get('url')
    });
  }
});


module.exports = new File();
