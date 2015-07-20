// authentication request is here, which has been hijacked to make it automatic

'use strict';

var _ = require('lodash');

var io = require('../services/io');
var Model = require('./Model');
var session = require('../models/session');
var uris = require('../services/uris');
var xhr = require('../services/xhr');


var Session = Model.extend({
  idAttribute: '_id',
  defaults: {
    clientId: '',
    ownerId: '',
    token: ''
  },
  initialize: function() {
    _.bindAll(this);
  },
  authenticate: function (config) {
    config = config || {};


    // commented out the following asynchronous authentication 
    // instead, mimmicking the success response below
  
    // if (!config.key) {
    //   io.alert('cannot authenticate without a key parameter');
    //   return;
    // }

    // if (!config.user) {
    //   io.warn('integrated owner (user) not specified');
    // }

    // xhr({
    //   context: this,
    //   method: 'POST',
    //   dataType: 'json',
    //   uri: uris('tokens'),
    //   data: config,
    //   success: function (data) {
    //     // data appears to be an object like this
    //     // {clientId: "55038c323c46cbc128000001", 
    //     //  ownerId: "55038c323c46cbc128000001", 
    //     //  token: "aglmd_tk_2cmFCxL7oDytws3hyvfMWAs6rVhziwyRMNDqZfx4xaaQbWFdduDNguMtUN9BWBCaZAnXHFMS"}
    //     this.set(data);
    //   },
    //   error: function () {
    //     io.alert('unable to generate session; no network or bad token');
    //   }
    // });
    
    // mimmicking the success response 
    this.set({clientId: "55038c323c46cbc128000001", 
        ownerId: "55038c323c46cbc128000001", 
        token: "aglmd_tk_2cmFCxL7oDytws3hyvfMWAs6rVhziwyRMNDqZfx4xaaQbWFdduDNguMtUN9BWBCaZAnXHFMS"})

  },
  inject: function (xhr) {
    var token = this.get('token') + ':';

    if (!token || token.length === 1) {
      io.crit('missing token; request may fail if authentication is required');
    }

    xhr.setRequestHeader('Authorization', ('Basic ' + btoa(token)));
  }
});


// this model is a singleton; immediately instantiate
var session = new Session();
module.exports = session;
