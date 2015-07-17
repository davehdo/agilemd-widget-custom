'use strict';

var _ = require('lodash');
var B = require('backdash');
B.$ = require('./lib/zepto');

var env = require('./services/env');
var io = require('./services/io');
require('./services/log');

var app;
var appElId = 'agilemd';

// subview config for the top-level view
var modalEl = '.aglmd-modal';
var modalActiveClass = 'aglmd-modal-active';
var ModalView = require('./views/modal');

var topnavEl = '.aglmd-navigation';
var TopNavigatorView = require('./views/navigator/top');

// subview config for the top-level view
var subviewEl = '.aglmd-content';
var Subviews = [
  require('./views/navigator/folder'),
  require('./views/file/algorithm'),
  require('./views/file/document'),
  require('./views/file/flowchart'),
  require('./views/file/pdf')
];


// temporary garbage scope
(function() {
  // load the stylesheet and apply temporary styles (respecting any set defaults)
  var elAgileMD = document.getElementById(appElId);
  if (elAgileMD) {
    elAgileMD.style.position = elAgileMD.style.position || 'relative';
    elAgileMD.style.width = elAgileMD.style.width || '100%';
  }

  var stylesheet = document.createElement('link');
  stylesheet.href = global.agilemd.DEBUG ?
    '/css/app.css' :
    'https://cdn.agilemd.com/widget/' +
      env('VERSION.M') + '/' +
      env('VERSION.m') + '/' +
      env('VERSION.p') + '/app.css';
  stylesheet.rel = 'stylesheet';
  stylesheet.type = 'text/css';
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
})();

var App = B.View.extend({
  el: '#' + appElId,
  template: require('./templates/app.html'),
  initialize: function() {
    _.bindAll(this);

    if (this.$el.is('body')) {
      io.warn(appElId + ' is the <body> element; setting html & body height');

      env.set({
        IS_FIXED_SIZE: true
      });

      B.$('html, body').addClass('aglmd-is-body');
    }

    this.setScroll();
    this.render();

    // setup persistant top navigation
    this.topnav = new TopNavigatorView();

    this.renderSubview(topnavEl, this.topnav);

    this.topnav.on('disabled', function () {
      this.removeNavigation();
    }, this);

    // setup modal, a special-case peer-view
    this.modal = new ModalView();

    this.modal.on('render', function () {
      this.$el.toggleClass(modalActiveClass, true);
      this.renderSubview(modalEl, this.modal);
    }, this);

    this.modal.on('unrender', function () {
      this.$el.toggleClass(modalActiveClass, false);
    }, this);

    // setup all child sub-views
    _.each(Subviews, function (View) {
      var subview = new View();

      subview.on('rendered', function () {
        this.resetScroll();
      }, this);

      subview.on('render', function () {
        this.renderSubview(subviewEl, subview);
      }, this);
    }, this);

    // start the application bus and replay queued commands
    io.init();

    // i can haz DOM?
    if (!B.$(this.el).length) {
      io.abort(this.el + ' must exist in the live DOM before loading the widget');
    }
  },
  removeNavigation: function () {
    this.$el.removeClass('aglmd-has-navigation');
  },
  render: function () {
    this.$el.append(this.template());

    this.$el.addClass('aglmd-has-navigation');
    this.$el.toggleClass('aglmd-content-fixed', env('IS_FIXED_SIZE'));

    this.trigger('rendered');

    return this;
  },
  renderSubview: function (el, subview) {
    subview.setElement(this.$el.children(el));
    subview.render();
    subview.delegateEvents();

    return this;
  },
  // these methods seek to preserve the scroll position of the externally
  //      managed DOM in the case where no explicit height was defined
  resetScroll: function () {
    if (!_.isUndefined(this.scrollTop)) {
      B.$('body').scrollTop(this.scrollTop);
    }
  },
  setScroll: function () {
    var height = this.$el.height();
    if (!height) {
      io.warn(appElId + ' does not have an explicit height;' +
        ' the document scroll position will receive updates');
      this.scrollTop = B.$('body').scrollTop();
    }

    env.set({
      IS_FIXED_SIZE: env('IS_FIXED_SIZE') || !!(height)
    });
  }
});

app = new App();
