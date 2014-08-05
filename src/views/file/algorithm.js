/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var io = require('../../services/io');
var templateNode = require('../../templates/file/algorithm/node.html');


var Algorithm = B.View.extend({
  model: require('../../viewmodels/file'),
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-node-response'] = 'uiOpenNode';
    out[action + ' h2'] = 'uiClickSection';

    return out;
  })(),
  template: require('../../templates/file/algorithm.html'),
  initialize: function () {
    _.bindAll(this);

    this.model.on('change:nodeIds', function (vm, nodeIds) {
      if (nodeIds && vm.get('type') === 'algorithm') {
        var $dom = B.$('.aglmd-algorithm-nodes');

        // if missing the element frame, render that before waiting
        // to render the nodes within the frame
        if (!$dom.length) {
          this.once('rendered', function () {
            this.renderAnchor(nodeIds);
            this.renderNodes(nodeIds);
          }, this);

          this.trigger('render');
          return;
        }

        this.renderAnchor(nodeIds);
        this.renderNodes(nodeIds);
      }
    }, this);
  },
  render: function () {
    this.$el.html(this.template());

    this.nodeWidth = Math.round(0.8375 * this.$el.width());

    // this.$el.find('.aglmd-algorithm-nodes-frame').on('scroll', this.uiUpdateAnchor);
    this.$el.find('.aglmd-algorithm-nodes-frame').on('scroll', _.debounce(
      this.uiUpdateAnchor, 50
    ));

    this.trigger('rendered');
  },
  renderAnchor: function (nodeIds) {
    var anchor = '';
    var versionId = this.model.get('versionId');

    _.forEach(nodeIds, function (nodeId) {
      var node = _.cloneDeep(this.model.get('nodes')[nodeId]);

      // shortcircuit if missing the target node
      if (!node) {
        io.error('nodeId=' + nodeId + ' listed in algorithm history but could not be found');
        return;
      }

      anchor = (node.anchor && node.anchor.length) ? node.anchor : anchor;
      if (!node.responses || node.responses.length === 0) {
        anchor = 'END' + (anchor.length ? ': ' + anchor : '');
      }
    }, this);

    this.$el.find('.aglmd-file-algorithm').toggleClass('aglmd-anchored', anchor.length);
    this.$el.find('.aglmd-algorithm-anchor').text(anchor);
  },
  renderNodes: function (nodeIds) {
    var $currentNodes = this.$el.find('.aglmd-node');
    var $scroller = this.$el.find('.aglmd-algorithm-nodes-frame');

    var lastMatchIndex = -1;
    var nodeIdsCt = nodeIds.length;

    var entityId = this.model.get('entityId');
    var versionId = this.model.get('versionId');

    // first, trim nodes that are no longer needed
    _.forEach(nodeIds, function (nodeId, i) {
      var $node = B.$($currentNodes[i]);

      if ($node.data('nid') === nodeId) {
        lastMatchIndex = i;
      } else {
        // break the loop as soon as a non-match is encountered
        return;
      }
    });

    // clean existing node structure; trim nodeIds to render appropriately
    if (lastMatchIndex !== -1) {
      var trimIndex = lastMatchIndex + 1;

      B.$($currentNodes.slice(trimIndex)).remove();
      nodeIds = nodeIds.slice(trimIndex);
    } else {
      this.$el.find('.aglmd-algorithm-nodes').empty();
    }

    // then, append any newly required nodes
    _.forEach(nodeIds, function (nodeId) {
      var node = _.cloneDeep(this.model.get('nodes')[nodeId]);

      if (!node) {
        io.error('nodeId=' + nodeId + ' does not exist in algorithm fileId=' + entityId + '; halting node render');
        return;
      }

      this.$el.addClass(String(+new Date()));
      this.$el.find('.aglmd-algorithm-nodes').append(
        templateNode(nodeId, node.prompt, node.responses, node.sections, this.nodeWidth)
      );
    }, this);

    // skip animation for 0 or 1 nodes displayed
    if (nodeIdsCt < 2) {
      return;
    }

    var width = Math.max($scroller[0].offsetWidth || 0, $scroller[0].scrollWidth || 0);
    var left = $scroller.scrollLeft();

    var tickFn;
    var ticks = 1;
    var tickTotalMS = 400;
    var tickFPS = 36;
    var tickMS = tickTotalMS / tickFPS;
    var tickCount = tickTotalMS / tickMS;
    var tickDist = Math.ceil((width - left) / tickCount);

    function scrollNodes () {
      $scroller.scrollLeft(left + ticks * tickDist);

      if (ticks >= tickCount) {
        clearInterval(tickFn);
      }

      ticks++;
    }

    tickFn = setInterval(scrollNodes, tickMS);
  },
  uiClickSection: function (e) {
    var $h2 = B.$(e.target).closest('h2');

    $h2.toggleClass('aglmd-active');
    $h2.next('.aglmd-section').toggleClass('aglmd-active');
  },
  uiOpenNode: function (e) {
    var $tgt = B.$(e.target).closest('.aglmd-node-response');
    var $node = B.$(e.target).closest('.aglmd-node');

    $tgt.siblings().removeClass('aglmd-active');
    $tgt.addClass('aglmd-active');
  
    var currentNodeId = $node.data('nid');
    var nodeIds = this.model.get('nodeIds');

    nodeIds = nodeIds.slice(0, _.findLastIndex(nodeIds, function (nid) {
      return nid === currentNodeId;
    }) + 1);

    nodeIds.push($tgt.data('nid'));

    this.model.set('nodeIds', nodeIds);
  },
  uiUpdateAnchor: function (e) {
    var $tgt = B.$(e.target);
    var nodeIds = this.model.get('nodeIds').slice();

    var scrollableWidth = Math.max(e.target.offsetWidth || 0, e.target.scrollWidth || 0);
    var visibleWidth = $tgt.width();

    // compute the most centered visible node
    var viewIndex = Math.round(
      $tgt.scrollLeft() / (scrollableWidth - visibleWidth) * (nodeIds.length - 1)
    );

    this.renderAnchor(nodeIds.slice(0, viewIndex+1));
  }
});


module.exports = Algorithm;
