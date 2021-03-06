'use strict';

var _ = require('lodash');
var B = require('backdash');
var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');


var Document = Model.extend({
  idAttribute: 'fileId',
  defaults: {
    fileId: null,
    attribution: null,
    content: '',
    infoTexts: {},
    title: null,
    textDir: 'ltr',
    textLang: 'en'
  },
  hydrate: function (fileId, moduleId) {
    this.url = uris('fileDocument', {
      fileId: fileId,
      moduleId: moduleId
    });

    this.fetch({
      beforeSend: session.inject,
      error: function () {
        io.crit('failed to retrieve document with fileId=' + fileId);
      }
    });
  },
  parse: function (raw) {
    raw = raw.file ? raw.file : raw;

    var parsed = {};

    parsed.fileId = raw.fileId;

    parsed.attribution = raw.meta.attribution;
    parsed.title = raw.meta.title;

    parsed.infoTexts = {};
    parsed.textDir = raw.meta.textDirection;
    parsed.textLang = raw.meta.textLanguage;

    var $html = B.$('<div>');

    _.each(raw.data.sections, function (section, i) {
      // creates a new div element for this section, to be inserted later into the DOM
      var $content = B.$('<div>');

      // fills the new div with section content
      $content.html(section.content);

      // if there are moreinfo sections then do a special manipulation
      $content.find('.aglmd-moreinfo').each(function () {
        var $this = B.$(this);
        var j = $this.data('infotext');

        var $infotext = $content.find('#aglmd-infotext-' + j);
        var iid = i + '_' + j;

        parsed.infoTexts[iid] = $infotext.html();

        $this.attr('data-iid', iid);
        $this.removeAttr('data-infotext');

        $infotext.remove();
      });

      // if there are images then do a special manipulation
      $content.find('img').each(function () {
        var $this = B.$(this);
        $this.attr('src', $this.data('src-raw'));
        $this.removeAttr('data-src-raw');
      });
      
      var content = $content.find('.aglmd-document').html();

      // DHD modification: if there is no .aglmd-document section within
      // the HTML then include all of section.contents
      if (content == null) {
        content = $content.html()
      }
      
      if (section.title.length > 0) {
        $html.append('<h2>' + section.title + '</h2>');
      }

      $html.append('<div class="aglmd-section">' + content + '</div>');
    });

    parsed.content = $html.html();

    return parsed;
  }
});


module.exports = Document;
