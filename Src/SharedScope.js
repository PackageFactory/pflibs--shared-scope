(function(module) {
  const SHARED_SCOPE_NAME = '@PackageFactory.Libraries:SharedScope';
  const SERIAL_VERSION_UUID = '1d8868ac-2911-4521-90c0-fac61e4cef19';

  // When there is already a Shared scope set in global context
  // use that instance
  if (typeof window[SHARED_SCOPE_NAME] !== 'undefined') {
    if (typeof window[SHARED_SCOPE_NAME].serialVersionUUID === 'function' &&
        SERIAL_VERSION_UUID === window[SHARED_SCOPE_NAME].serialVersionUUID()) {
      module.exports = window[SHARED_SCOPE_NAME];
      return;
    }

    throw new Error(`${SHARED_SCOPE_NAME} is already present in window, but incompatible`);
  }

  /**
   * Managed, Shared global scope
   * @constructor
   */
  let SharedScope = function() {
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
  SharedScope.prototype.set = function(key, value) {
    this.__repository[key] = value;

    if (typeof this.__listeners[key] !== 'undefined') {
      this.__listeners[key].forEach((callback) => callback(value));
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
  SharedScope.prototype.expose = function(baseKey, map) {
    Object.keys(map).forEach(key => this.set(baseKey + key, map[key]));
  };

  /**
   * Listen (internally) for a resource to be set
   *
   * @private
   * @param {string} key
   * @param {function} callback
   * @return void
   */
  SharedScope.prototype.__listen = function(key, callback) {
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
  SharedScope.prototype.expect = function(key, timeout = 1000) {
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
  SharedScope.prototype.__expectOne = function(key, timeout = 1000) {
    return new Promise((resolve, reject) => {
      if (typeof this.__repository[key] !== 'undefined') {
        resolve(this.__repository[key]);
        return;
      }

      this.__listen(key, (value) => {
        resolve(value);
      });
      setTimeout(() => {
        reject(new Error(`Expectation timed out after ${timeout} milliseconds.`));
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
  SharedScope.prototype.__expectAll = function(keys, timeout=1000) {
    return Promise.all(keys.map( val => this.__expectOne(val, timeout) ));
  };

  /**
   * Get the serial version UUID
   *
   * @api
   * @return {string}
   */
  SharedScope.prototype.serialVersionUUID = function() {
    return SERIAL_VERSION_UUID;
  };

  window[SHARED_SCOPE_NAME] = new SharedScope();
  module.exports = window[SHARED_SCOPE_NAME];
})(module);
