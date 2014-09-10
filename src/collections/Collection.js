'use strict';

var _ = require('lodash');
var B = require('backdash');


var Collection = B.Collection.extend({
  _xhrAttempts: 0,
  _xhrRetries: 5,
  _xhrTimer: 0,
  sync: function (method, model, options) {
    var self = this;
    var fnError = options.error;
    var fnSuccess = options.success;
    var tsStart = +new Date();

    options.success = function (data, status, xhr) {
      var fnSuccessArgs = arguments;
      var tsEnd = +new Date();

      self.trigger('xhr', {
        lag: tsEnd - tsStart,
        status: xhr.status,
        uri: _.isFunction(self.url) ? self.url() : self.url
      });

      self._xhrAttempts = 0;
      self._xhrTimer = 0;
      fnSuccess.apply(self, fnSuccessArgs);
    };

    options.error = function (xhr) {
      var fnErrorArgs = arguments;
      var tsEnd = +new Date();

      if (
        (xhr.status === 0 || xhr.status > 399) &&
        self._xhrAttempts < self._xhrRetries
      ) {
        self._xhrAttempts++;

        setTimeout(function () {
          B.sync.call(self, method, model, _.cloneDeep(options));
        }, 400 * Math.pow(self._xhrAttempts, 2));
      } else {
        self.trigger('xhr', {
          lag: tsEnd - tsStart,
          status: xhr.status,
          uri: _.isFunction(self.url) ? self.url() : self.url
        });

        self._xhrAttempts = 0;
        self._xhrTimer = 0;
        fnError.apply(self, fnErrorArgs);
      }
    };

    B.sync.call(self, method, model, _.cloneDeep(options));
  }
});


module.exports = Collection;
