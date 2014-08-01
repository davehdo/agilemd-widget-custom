/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');
var ViewModel = require('./ViewModel');

var io = require('../services/io');
var search = require('../services/search');


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
            io.error('unable to locate valid file for id=' + entityId);
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
  }
});


module.exports = new ViewModel();
