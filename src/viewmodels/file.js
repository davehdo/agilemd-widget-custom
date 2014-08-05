/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');
var ViewModel = require('./ViewModel');

var io = require('../services/io');
var search = require('../services/search');

var algorithms = require('../collections/algorithms');
var documents = require('../collections/documents');


// type is used by different file viewers
var ViewModel = ViewModel.extend({
  defaults: {
    title: null,
    type: null,
    entityId: null,
    versionId: null
  },
  initialize: function() {
    _.bindAll(this);

    this.on('change:entityId', function () {
      var entityId = this.get('entityId');
      var versionId = this.get('versionId');

      if (entityId && !versionId) {
        search.byId(entityId, function (results) {
          if (results.length === 0) {
            io.error('unable to locate valid file for fileId=' + entityId);
            return;
          }

          var mostRecentVersion = _.sortBy(results, '_id').pop();

          this.set({
            type: mostRecentVersion._type,
            versionId: mostRecentVersion._id
          });
        }, this);
      }
    }, this);

    this.on('change:versionId', function (vm, versionId) {
      // ignore transitions
      if (!versionId) return;

      var collection;
      var prepare;

      if (vm.get('type') === 'document') {
        collection = documents;
        prepare = this.prepareDocument;
      }
      else if (vm.get('type') === 'algorithm') {
        collection = algorithms;
        prepare = this.prepareAlgorithm;
      }
      else {
        var msg = 'cannot get data for unknown file type fileId=';
        msg += vm.get('entityId') + ', versionId=' + vm.get('versionId');

        io.warn(msg);
        return;
      }

      // get the file...
      var file = collection.get(versionId);

      // if the file exists, prepare the view model immediately
      // else, hydrate then prepare
      if (file) {
        prepare(file);
        return;
      }

      file = collection.add({
        _id: versionId,
        _entityId: vm.get('entityId')
      });

      file.once('sync', function (newDoc) {
        prepare(newDoc);
      });

      file.hydrate();
    }, this);
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
  }
});


module.exports = new ViewModel();
