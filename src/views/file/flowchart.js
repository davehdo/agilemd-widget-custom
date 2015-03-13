/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var vmModal = require('../../viewmodels/modal');


function getDistance (ptA, ptB) {
  var xs = 0;
  var ys = 0;

  xs = ptA[0] - ptB[0];
  xs = xs * xs;

  ys = ptA[1] - ptB[1];
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}

function getCoords ($el) {
  return [
    parseInt($el.css('left'), 10),
    parseInt($el.css('top'), 10)
  ];
}

var Flowchart = B.View.extend({
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-moreinfo'] = 'uiClickInfo';
    out[action + ' .aglmd-flowchart-openextra'] = 'uiClickExtra';

    return out;
  })(),
  model: require('../../viewmodels/file'),
  template: require('../../templates/file/flowchart.html'),
  initialize: function () {
    _.bindAll(this);

    this.isRetina = env('IS_RETINA');

    this.model.on('change:chart', function (vm, chart) {
      if (chart && vm.get('type') === 'flowchart') {
        this.trigger('render');
      }
    }, this);
  },
  checkHeight: function () {
    var $flowchart = this.$el.find('.aglmd-file-flowchart');

    var currentHeight = $flowchart.height();
    var newHeight = currentHeight;

    this.$el.find('.aglmd-node').each(function () {
      var $node = B.$(this);
      var localHeight = $node.height() + parseInt($node.css('top'), 10);

      if (localHeight > newHeight) {
        newHeight = localHeight;
      }
    });

    if (newHeight > currentHeight) {
      $flowchart.height(newHeight);
    }
  },
  initExtra: function () {
    var $start = this.$el.find('.aglmd-start');
    var $button = this.$el.find('.aglmd-flowchart-openextra');

    var distance = this.$el.width();
    var ptA = getCoords($start);

    var btnLeft = ptA[0];
    var btnTop = ptA[1];

    this.$el.find('.aglmd-node').each(function () {
      var $node = B.$(this);
      var nodeWith = $node.width();

      var ptB = getCoords($node);
      ptB[0] += nodeWith;

      var distanceTest = getDistance(ptA, ptB);

      if (distanceTest < distance) {
        btnLeft = ptB[0];
        btnTop = ptB[1];

        distance = distanceTest;
      }
    });

    // slight padding
    btnLeft = btnLeft + 10;
    btnTop = btnTop + 5;

    $button.css('left', btnLeft + 'px');
    $button.css('top', btnTop + 'px');
  },
  initPosition: function () {
    var $container = B.$('.aglmd-content');
    var $start = this.$el.find('.aglmd-start');

    var left = parseInt($start.css('left'), 10);
    left = Math.floor(left - $container.width() / 2);

    $container.scrollLeft(left);
    $container.scrollTop(parseInt($start.css('top'), 10));
  },
  render: function () {
    var chart = this.model.get('chart');
    var chartStyle = this.model.get('chartStyle');
    var content = this.model.get('content');
    var hasExtra = (content && content.length);

    this.$el.html(this.template(
      chart,
      chartStyle,
      hasExtra
    ));

    this.checkHeight();
    this.initPosition();

    if (hasExtra) {
      this.initExtra();
    }

    this.trigger('rendered');
  },
  uiClickInfo: function (e) {
    var $info = B.$(e.target).closest('.aglmd-moreinfo');
    var iid = $info.data('infotext');
    var $infotext = this.$el.find('#aglmd-infotext-' + iid);

    vmModal.transition({
      title: $info.text(),
      content: $infotext.html(),
      top: env('IS_FIXED_SIZE') ? 0 : $info.offset().top
    });
  },
  uiClickExtra: function (e) {
    var $btn = B.$(e.target).closest('.aglmd-flowchart-openextra');

    vmModal.transition({
      title: 'Pathway information',
      content: this.model.get('content'),
      top: env('IS_FIXED_SIZE') ? 0 : $btn.offset().top
    });
  },
  uiClickSection: function (e) {
    var $h2 = B.$(e.target).closest('h2');

    $h2.toggleClass('aglmd-active');
    $h2.next('.aglmd-section').toggleClass('aglmd-active');
  }
});


module.exports = Flowchart;
