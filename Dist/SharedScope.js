(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SharedScope = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function (module) {
  var SHARED_SCOPE_NAME = '@PackageFactory.Libraries:SharedScope';
  var SERIAL_VERSION_UUID = '1d8868ac-2911-4521-90c0-fac61e4cef19';

  // When there is already a Shared scope set in global context
  // use that instance
  if (typeof window[SHARED_SCOPE_NAME] !== 'undefined') {
    if (typeof window[SHARED_SCOPE_NAME].serialVersionUUID === 'function' && SERIAL_VERSION_UUID === window[SHARED_SCOPE_NAME].serialVersionUUID()) {
      module.exports = window[SHARED_SCOPE_NAME];
      return;
    }

    throw new Error(SHARED_SCOPE_NAME + ' is already present in window, but incompatible');
  }

  /**
   * Managed, Shared global scope
   * @constructor
   */
  var SharedScope = function SharedScope() {
    this.__repository = {};
    this.__listeners = {};
  };

  /**
   * Set a new value
   *
   * @api
   * @param {string} key
   * @param {*} value
   */
  SharedScope.prototype.set = function (key, value) {
    this.__repository[key] = value;

    if (typeof this.__listeners[key] !== 'undefined') {
      this.__listeners[key].forEach(function (callback) {
        return callback(value);
      });
      delete this.__listeners[key];
    }
  };

  /**
   * Expose a namespaced map of values
   *
   * @api
   * @param {string} baseKey
   * @param {object} map
   * @return void
   */
  SharedScope.prototype.expose = function (baseKey, map) {
    var _this = this;

    Object.keys(map).forEach(function (key) {
      return _this.set(baseKey + key, map[key]);
    });
  };

  /**
   * Listen (internally) for a resource to be set
   *
   * @private
   * @param {string} key
   * @param {function} callback
   * @return void
   */
  SharedScope.prototype.__listen = function (key, callback) {
    this.__listeners[key] || (this.__listeners[key] = []);
    this.__listeners[key].push(callback);
  };

  /**
   * Expect a resource in this scope
   *
   * @api
   * @param {string} key Identifies the resource
   * @param {number} [timeout] An (optional) timeout in ms - defaults to 1000
   * @return {Promise}
   */
  SharedScope.prototype.expect = function (key) {
    var timeout = arguments[1] === undefined ? 1000 : arguments[1];

    if (typeof key === 'string') {
      return this.__expectOne(key, timeout);
    }

    return this.__expectAll(key, timeout);
  };

  /**
   * (Internally) Create a promise for one resource
   *
   * @param {string} key identifies the resource
   * @param {number} timeout An (optional) timeout in ms - defaults to 1000
   * @return {Promise}
   */
  SharedScope.prototype.__expectOne = function (key) {
    var _this2 = this;

    var timeout = arguments[1] === undefined ? 1000 : arguments[1];

    return new Promise(function (resolve, reject) {
      if (typeof _this2.__repository[key] !== 'undefined') {
        resolve(_this2.__repository[key]);
        return;
      }

      _this2.__listen(key, function (value) {
        resolve(value);
      });
      setTimeout(function () {
        reject(new Error('Expectation timed out after ' + timeout + ' milliseconds.'));
      }, timeout);
    });
  };

  /**
   * (Internally) Create a promise for multiple resources
   *
   * @private
   * @param {string[]} keys
   * @param {number} timeout An (optional) timeout in ms - defaults to 1000
   * @return {Promise}
   */
  SharedScope.prototype.__expectAll = function (keys) {
    var _this3 = this;

    var timeout = arguments[1] === undefined ? 1000 : arguments[1];

    return Promise.all(keys.map(function (val) {
      return _this3.__expectOne(val, timeout);
    }));
  };

  /**
   * Get the serial version UUID
   *
   * @api
   * @return {string}
   */
  SharedScope.prototype.serialVersionUUID = function () {
    return SERIAL_VERSION_UUID;
  };

  window[SHARED_SCOPE_NAME] = new SharedScope();
  module.exports = window[SHARED_SCOPE_NAME];
})(module);

},{}]},{},[1])(1)
});