'use strict';

var _ = require('lodash');
var B = require('backdash');
var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Flowchart = Model.extend({
  idAttribute: 'fileId',
  defaults: {
    fileId: null,
    attribution: null,
    chart: '',
    content: '',
    title: null
  },
  hydrate: function (fileId, moduleId) {
    this.url = uris('fileFlowchart', {
      fileId: fileId,
      moduleId: moduleId
    });

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve flowchart with fileId=' + fileId);
      }
    });
  },
  parse: function (raw) {
    raw = raw.file ? raw.file : raw;

    var parsed = {};

    parsed.fileId = raw.fileId;

    parsed.attribution = raw.meta.attribution;
    parsed.title = raw.meta.title;

    var $chart = B.$('<div>');
    var $content = B.$('<div>');
    var $flowchart;

    $chart.append(raw.data.chart);
    $flowchart = $chart.find('.aglmd-flowchart');
    $chart.html($flowchart.html());

    parsed.chart = $chart.html();
    parsed.chartStyle = $flowchart.attr('style');

    _.each(raw.data.sections, function (section) {
      if (section.title.length > 0) {
        $content.append('<h2>' + section.title + '</h2>');
      }

      $content.append('<div class="aglmd-section">' + section.content + '</div>');
    });

    $content.find('img').each(function () {
      var $this = B.$(this);
      $this.attr('src', $this.data('src-raw'));
      $this.removeAttr('data-src-raw');
    });

    parsed.content = $content.html();

    return parsed;
  }
});


module.exports = Flowchart;
