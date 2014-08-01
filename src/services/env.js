/* jslint node: true */
'use strict';

var _ = require('lodash');

var env = {};
env.IS_LOCALHOST = (/localhost/.test(window.location.href));


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
