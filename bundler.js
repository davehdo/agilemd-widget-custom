/* 
  running from the command line "node bundler" will
  run this, which uses browserify's bundler method to 
  compile javascript files, with their "require" functions
  into one single javascript
*/
/* jslint node: true */
'use strict';

// node core
var argparse = require('argparse');
var envify = require('envify/custom');
var fs = require('fs');
var git = require('git-rev');
var path = require('path');
var pjson = require('./package.json');
var blissify = require('blissify');
var browserify = require('browserify');
var uglifyify = require('uglifyify');
var watchify = require('watchify');

var commit = 'xxxxxxxx';
var version = pjson.version.split('.');

// setup arg parsing
var parser = new argparse.ArgumentParser({
  addHelp: true,
  description: 'browserify bundler ftw'
});

parser.addArgument(
  [ '-w', '--watch' ],
  {
    action: 'storeTrue',
    defaultValue: false,
    help: 'run bundler watch mode'
  }
);

parser.addArgument(
  [ '-m', '--map' ],
  {
    action: 'storeTrue',
    defaultValue: false,
    help: 'include source map within build'
  }
);

// thumbs up, let's do this...
var args = parser.parseArgs();
var _watch = args.watch;
console.log('[bundler] watch ?=', _watch);
var _map = args.map;
console.log('[bundler] map ?=', _map);

var _options = watchify.args;

if (_map) {
  _options.debug = true;
}

var b = browserify(_options);
var bundler = b;

function _build () {
  console.log('[bundler] building...');
  bundler.bundle().on('error', _err).pipe(fs.createWriteStream('./_build/app.js'));
}

function _err (err) {
  console.warn('[bundler] build error', err);
  console.warn('[bundler] waiting for file change to retry');
  return;
}

if (_watch) {
  bundler = watchify(b);

  blissify.verbose = true;

  bundler.on('update', function () {
    console.log('[bundler] update detected...');
    _build();
  });

  bundler.on('bytes', function (bytes) {
    var kb = Math.round(bytes / 1024);
    console.log('[bundler] done, size = ' + kb + ' kb');
  });

  bundler.on('time', function (ms) {
    console.log('[bundler] done, time = ' + ms + ' ms');
  });
}

// if >1 callback is needed, switch to promises
git.long(function (str) {
  commit = str.substring(0, 8);

  bundler.add('./src/app.js');
  bundler.transform(blissify);
  bundler.transform(envify({
    AGLMD_APP_MAJOR: version[0],
    AGLMD_APP_MINOR: version[1],
    AGLMD_APP_PATCH: version[2],
    AGLMD_APP_COMMIT: commit
  }));

  if (!_watch) {
    bundler.transform({
      global: true
    }, 'uglifyify');
  }

  _build();
});
