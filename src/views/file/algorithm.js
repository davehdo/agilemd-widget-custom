/* jslint node: true */
'use strict';

var _ = require('lodash');
var B = require('backdash');

var env = require('../../services/env');
var io = require('../../services/io');
var templateNode = require('../../templates/file/algorithm/node.html');


var Algorithm = B.View.extend({
  collection: require('../../collections/algorithms'),
  events: (function () {
    var action = env('USE_TAP') ? 'tap' : 'click';

    var out = [];
    out[action + ' .aglmd-node-response'] = 'uiOpenNode';
    out[action + ' h2'] = 'uiClickSection';

    return out;
  })(),
  viewmodel: require('../../viewmodels/file'),
  template: require('../../templates/file/algorithm.html'),
  initialize: function () {
    _.bindAll(this);

    this.viewmodel.on('change:versionId', function (vm, versionId) {
      // ignore non-algorithm type files
      if (vm.get('type') !== 'algorithm') return;

      var algorithm = this.collection.get(versionId);

      // once scaffold ready, prepare the content
      this.once('rendered', function () {
        // if data available, prepare the view immediately
        // else, hydrate then prepare
        if (algorithm) {
          this.prepare(algorithm);
          return;
        }

        algorithm = this.collection.add({
          _id: versionId,
          _entityId: vm.get('entityId')
        });

        algorithm.once('sync', function (newAlgorithm) {
          this.prepare(newAlgorithm);
        }, this);

        algorithm.hydrate();
      }, this);

      this.trigger('render');
    }, this);

    this.viewmodel.on('change:nodeIds', function (vm, nodeIds) {
      if (nodeIds && vm.get('type') === 'algorithm') {
        this.renderAnchor(nodeIds);
        this.renderNodes(nodeIds);
      }
    }, this);
  },
  prepare: function (algorithm) {
    this.viewmodel.set({
      attribution: algorithm.get('attribution'),
      nodeIds: [algorithm.get('rootNodeId')],
      title: algorithm.get('title')
    });
  },
  render: function () {
    this.$el.html(this.template());

    this.nodeWidth = Math.round(0.8375 * this.$el.width());

    // this.$el.find('.aglmd-algorithm-nodes-frame').on('scroll', this.uiUpdateAnchor);
    this.$el.find('.aglmd-algorithm-nodes-frame').on('scroll', _.debounce(
      this.uiUpdateAnchor,
      50,
      {leading: true}
    ));

    this.trigger('rendered');
  },
  renderAnchor: function (nodeIds) {
    var anchor = '';
    var versionId = this.viewmodel.get('versionId');

    var algorithm = this.collection.get(versionId);
    _.forEach(nodeIds, function (nodeId) {
      var node = algorithm.getNode(nodeId);

      // shortcircuit if missing the target node
      if (!node) {
        io.warn('nodeId=' + nodeId + ' listed in algorithm history but could not be found');
        return;
      }

      anchor = (node.anchor && node.anchor.length) ? node.anchor : anchor;
      if (!node.responses || node.responses.length === 0) {
        anchor = 'END' + (anchor.length ? ': ' + anchor : '');
      }
    });

    this.$el.find('.aglmd-file-algorithm').toggleClass('aglmd-anchored', anchor.length);
    this.$el.find('.aglmd-algorithm-anchor').text(anchor);
  },
  renderNodes: function (nodeIds) {
    var $currentNodes = this.$el.find('.aglmd-node');
    var $scroller = this.$el.find('.aglmd-algorithm-nodes-frame');

    var lastMatchIndex = -1;
    var nodeIdsCt = nodeIds.length;

    var entityId = this.viewmodel.get('entityId');
    var versionId = this.viewmodel.get('versionId');

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
    var algorithm = this.collection.get(versionId);
    _.forEach(nodeIds, function (nodeId) {
      var node = algorithm.getNode(nodeId);

      if (!node) {
        io.crit('nodeId=' + nodeId + ' does not exist in algorithm fileId=' + entityId + '; halting node render');
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
    var nodeIds = this.viewmodel.get('nodeIds');

    nodeIds = nodeIds.slice(0, _.findLastIndex(nodeIds, function (nid) {
      return nid === currentNodeId;
    }) + 1);

    nodeIds.push($tgt.data('nid'));

    this.viewmodel.set('nodeIds', nodeIds);
  },
  uiUpdateAnchor: function (e) {
    var $tgt = B.$(e.target);
    var nodeIds = this.viewmodel.get('nodeIds').slice();

    var scrollableWidth = Math.max(e.target.offsetWidth || 0, e.target.scrollWidth || 0);
    var visibleWidth = $tgt.width();

    // compute the most centered visible node
    var viewIndex = Math.round(
      $tgt.scrollLeft() / (scrollableWidth - visibleWidth) * nodeIds.length
    );

    this.renderAnchor(nodeIds.slice(0, viewIndex+1));
  }
});


module.exports = Algorithm;
