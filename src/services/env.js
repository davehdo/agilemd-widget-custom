/* jslint node: true */
'use strict';

var _ = require('lodash');
var UAParser = require('ua-parser-js');

var env = {};
(function () {
  var parser = new UAParser();
  var ua = parser.setUA(navigator.userAgent).getResult();

  env.FILE_TYPES = ['algorithm', 'document', 'flowchart', 'pdf'];

  env.IS_LOCALHOST = (/localhost/.test(window.location.href));

  env.IS_PROD = !global.agilemd.DEBUG;

  env.IS_RETINA = (global.devicePixelRatio > 1);

  // catch certain touch devices with 300ms click lag
  env.USE_TAP = ('ontouchstart' in window) && (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    /Android/i.test(navigator.userAgent)
  );

  var machineName = ua.device.vendor || '';
  machineName = (ua.device.model) ?
    (machineName.length ? machineName + ' ' : '') + ua.device.model :
    '';

  env.AGENT = {
    machine: {
      name: machineName.length ? machineName : 'unknown',
      m: ua.device.version || -1,
      n: -1
    },
    os: {
      name: (ua.os.name && ua.os.name.length) ? ua.os.name : 'unknown',
      m: ua.os.version || -1,
      n: -1
    },
    browser: {
      name: (ua.browser.name && ua.browser.name.length) ? ua.browser.name : 'unknown',
      m: ua.browser.major || -1,
      n: ua.browser.version || -1
    }
  };

  env.VERSION = {
    M: process.env.AGLMD_APP_MAJOR,
    m: process.env.AGLMD_APP_MINOR,
    p: process.env.AGLMD_APP_PATCH,
    c: process.env.AGLMD_APP_COMMIT
  };
})();


function get (key) {
  var prop = key.split('.'),
  last = prop.pop(),
  value = env;

  for (var i = 0, _len = prop.length; i < _len; i++) {
    if(typeof value === 'object') {
      value = value[prop[i]];
      continue;
    }

    // something went wrong in object chain
    value = {};
    break;
  }

  return value[last];
}

function all () {
  return _.cloneDeep(env);
}

// tread carefully...
function set (moreEnv) {
  env = _.extend(env, moreEnv);
}


module.exports = get;
module.exports.all = all;
module.exports.set = set;
