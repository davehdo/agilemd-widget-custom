/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');


var PDF = B.View.extend({
  model: require('../../viewmodels/file'),
  template: require('../../templates/file/pdf.html'),
  initialize: function () {
    _.bindAll(this);

    this.model.on('change:url', function (vm, url) {
      if (url && vm.get('type') === 'pdf') {
        this.trigger('render');
      }
    }, this);
  },
  render: function () {
    var url = this.model.get('url');

    this.$el.html(this.template(url));

    this.trigger('rendered');
  }
});


module.exports = PDF;
