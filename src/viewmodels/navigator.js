'use strict';

var _ = require('lodash');
var ViewModel = require('./ViewModel');

var io = require('../services/io');


var Navigator = ViewModel.extend({
  collection: require('../collections/modules'),
  defaults: {
    // persistant state
    isDisabled: false,
    // viewed model
    moduleId: null,
    art: null,
    folders: {},
    subtitle: null,
    title: null,
    // top-nav properties
    topTitle: null,
    topSubtitle: null,
    // main-nav properties
    path: []
  },
  initialize: function() {
    // listen for state-control changes
    this.on('change:moduleId', function (vm, moduleId) {
      // load the default module for this integration
      if (moduleId === -1) {
        if (this.collection.length) {
          this.loadDefault();
          return;
        }

        this.collection.once('sync', function () {
          this.loadDefault();
        }, this);

        this.collection.hydrate();
      }
      // load a specific module
      else if (moduleId) {
        var module = this.collection.get(moduleId);

        // if the module is missing OR has not been hydrated, load it
        if (!module || !module.get('folders')._rootId) {
          module = this.collection.add({
            _id: moduleId
          });

          module.on('sync', function (newModule) {
            this.prepare(newModule);
          }, this);

          module.hydrate();
          return;
        }

        this.prepare(module);
      }
    }, this);
  },
  loadDefault: function () {
    var module = this.collection.last();

    if (!module) {
      io.alert('no default module could be found');
      return;
    }

    this.set('moduleId', module.id);
  },
  prepare: function (module) {
    var folders = module.get('folders');

    this.set({
      // viewed model
      moduleId: module.id,
      art: module.get('art'),
      folders: folders,
      subtitle: module.get('title'),
      title: module.get('title'),
      // main-nav state
      path: [folders[folders._rootId]]
    });
  },
  transition: function (toState) {
    toState = toState || {};

    // the isDisabled property must be explicitly set;
    // lazy transitioning is not allowed
    toState.isDisabled = this.get('isDisabled');
    toState = _.extend(_.clone(this.defaults), toState);

    this.clear().set(toState);
  }
});


module.exports = new Navigator();
