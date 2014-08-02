<a href="http://promisesaplus.com/">
    <img src="https://cdn.agilemd.com/assets/logo/github_hxvvitf8.png" alt="AgileMD" title="by AgileMD, Inc." align="right" />
</a>

Widget
======

A programmatic, web-based view for [AgileMD](http://www.agilemd.com) designed for embedded applications.


### Instantiation

Within the `<head>` of your document:

```
(function (d, a) {
  window.agilemd = a;
  var q, r, s, t;
  q = ['init', 'open', 'on'];
  s = d.createElement('script');
  s.type = 'text/javascript';
  s.async = !0;
  s.src = 'https://cdn.agilemd.com/widget/3/app.js';
  a._v = 3.0; a._s = s.src; a._q = [];
  r = function (m) {
    return function () {
      a._q.push([m, Array.prototype.slice.call(arguments)]);
    };
  };
  for (i = 0; i < q.length; i++) {
    a[q[i]] = r(q[i]);
  }
  t = d.getElementsByTagName('script')[0];
  t.parentNode.insertBefore(s, t);
})(document, window.agilemd || {});

agilemd.init({
  email: 'me@example.com',
  token: 'pk_live_EXAMPLE'
});
```

Within the `<body>` of your document:

```
<div id="agilemd"></div>
```


### Documentation

- Implementation Options
- Client API
- Client Errors
- Support Matrix
- Public & Private Keys
- Release Strategy & History
- Issue Templates


### Get an API Key

Access to AgileMD content via widget requires a Public API Key. You can obtain a key for your project by contacting support@agilemd.com.


### Contribute

First, review our contribution guidelines. Then, [fork](https://github.com/agilemd/widget/fork) and clone this repository to your local machine. You need [node](http://nodejs.org) and [SASS](http://sass-lang.com) installed and available in your `$PATH`.

**Development**

`cd` into the project folder and run `npm install`. Then, execute:

```
npm run dev
```

This command launches several processes in parallel:

- Run the [browserify](http://browserify.org) bundler in [watch mode](https://github.com/substack/watchify) with [source maps](https://developer.chrome.com/devtools/docs/javascript-debugging#source-maps) enabled
- Run SASS in watch mode to compile CSS on-the-fly
- Run a local [express](http://expressjs.com) server on port `8080` to serve assets

Any change to a traceable project file is detected by the respective agent (browserify and SASS) and immediately triggers a rebuild of the target asset. Errors, updates, and performance data are logged to `stdout`.

By default, the dev server uses a demo API key to provide access to AgileMD content. You can use your own API key by editing `./dev/views/_head.ejs` to test Widget against your own resources.

**Components**

Widget builds upon several well-tested projects. And, thanks to browserify, components do not leak any variables into the global namespace.

- [backbone](http://backbonejs.org) via [backdash](https://www.npmjs.org/package/backdash) (Organizing framework)
- [lodash](http://lodash.com/docs) (Utility functions)
- [zepto](http://zeptojs.com/) custom build (DOM manipulation & XHR)

**Generate [zepto.js](https://github.com/madrobby/zepto/blob/master/README.md)**

1. Clone `git@github.com:madrobby/zepto.git`, run `npm install`
2. Run `MODULES="zepto event ajax touch selector" npm run-script dist` in zepto repo
3. Copy un-minified (dev) version to `./lib` in this repository
4. Add new last line: `module.exports = Zepto;` and remove any `window` setters
5. In bundler entry file, require Zepto into backdash instance: `B.$ = require('./lib/zepto');`

**Build**

To output production-level assets (which adds uglification and minification), run:

```
npm run build
```

Assets are built into `./_build`.
