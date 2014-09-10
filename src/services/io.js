'use strict';

var ERRORS = {
  'abort': 0,
  'alert': 1,
  'crit': 2,
  'error': 3,
  'warn': 4
};

var _ = require('lodash');
var B = require('backdash');

var vmFile = require('../viewmodels/file');
var vmNavigator = require('../viewmodels/navigator');
var session = require('../models/session');

var bus = _.extend({}, B.Events);
var stdout = _.extend({}, B.Events);


// convert the global context to an event emitter
//      NOTE: only the subscription mechanism is exposed
global.agilemd.on = stdout.on;

// apply previously created handlers; capture last init command
_.each(global.agilemd._q, function (cmd) {
  if (cmd[0] === 'on') {
    stdout.on(cmd[1][0], cmd[1][1], cmd[1][2] || global);
  }
});

// replay recorded events once other components are ready;
//      also, convert queue api into direct api function calls
function init () {
  var cmdInit;
  var cmdOpen;

  // once auth received, play last recorded open event
  session.on('change:token', function () {
    global.agilemd.open = function (type, id) {
      if (type === 'module') {
        vmNavigator.transition({
          moduleId: id
        });
      }
      else {
        vmFile.transition({
          entityId: id
        });
      }
    };

    // replay the last open command; once again filter through events
    //      to handle accumlation while auth was taking place
    cmdOpen = _.findLast(global.agilemd._q, function (cmd) {
      return cmd[0] === 'open';
    });

    if (cmdOpen) {
      global.agilemd.open.apply(null, cmdOpen[1]);
    } else {
      // set an known unknown state; default the app into viewing the
      //      first module to which the token provides access
      vmNavigator.transition({
        moduleId: -1
      });
    }

    // clean up queue parameters
    global.agilemd._q = [];
  });

  // expose open as public api; open events are still enqueued until
  //      auth completes
  global.agilemd.open = function () {
    global.agilemd._q.push([
      'open',
      Array.prototype.slice.call(arguments)
    ]);
  };

  // if available, replay the most recent init command;
  // expose init as public api
  cmdInit = _.findLast(global.agilemd._q, function (cmd) {
    return cmd[0] === 'init';
  });

  if (cmdInit) {
    var rawInit = (cmdInit[1] && cmdInit[1].length) ? cmdInit[1][0] : {};

    // check for navigation config
    if (rawInit.disableNavigation) {
      vmNavigator.set('isDisabled', rawInit.disableNavigation);
      delete rawInit.disableNavigation;
    }

    // check for open wihin config and proxy into open commands
    if (rawInit.file) {
      global.agilemd.open('file', rawInit.file);
      delete rawInit.file;
    }
    else if (rawInit.module) {
      global.agilemd.open('module', rawInit.module);
      delete rawInit.module;
    }

    session.authenticate.apply(null, cmdInit[1]);
  }

  global.agilemd.init = session.authenticate;
}

// emit relevant auth events
session.on('change:token', function (model) {
  stdout.trigger('auth', {
    clientId: model.get('clientId'),
    ownerId: model.get('ownerId')
  });
});

// outbound messages bound to view model changes
vmNavigator.on('change', function (vm) {
  var changed = vm.changedAttributes();

  if (changed.path && changed.path.length) {
    var currentFolder = changed.path[changed.path.length - 1];

    stdout.trigger('openFolder', {
      moduleId: vm.get('moduleId'),
      folderId: currentFolder._id,
      folderTitle: currentFolder.title
    });
  }

  if (changed.title) {
    stdout.trigger('openModule', {
      moduleId: vm.get('moduleId'),
      moduleTitle: changed.title
    });
  }
});

vmFile.on('change', function (vm) {
  var changed = vm.changedAttributes();

  if (changed.title) {
    stdout.trigger('openFile', {
      fileId: vm.get('entityId'),
      fileTitle: changed.title,
      fileType: vm.get('type')
    });
  }

  if (changed.nodeIds) {
    var nodeIds = changed.nodeIds.slice(0);

    stdout.trigger('openNode', {
      fileId: vm.get('entityId'),
      nodeId: nodeIds.pop(),
      nodeIdHistory: nodeIds
    });
  }
});


// export errors that proxy into the exposed api
_.each(ERRORS, function (code, key) {
  module.exports[key] = bus[key] = function (msg) {
    stdout.trigger('error', {
      code: code,
      message: msg
    });
  };
});

module.exports.init = init;
module.exports.on = bus.on;
module.exports.trigger = bus.trigger;
