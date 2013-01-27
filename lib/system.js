/**
 * Module dependencies.
 */
var uri = require('url')
  , ssh = require('./net/ssh')
  , utils = require('./utils')
  , debug = require('debug')('baton');


/**
 * `System` constructor.
 *
 * A system is an individual node within a larger network of systems.
 *
 * @param {String} url
 * @param {Object} options
 * @api protected
 */
function System(url, options) {
  if (url.indexOf('://') == -1) {
    url = 'ssh://' + url;
  }
  options = options || {};

  this.url = url;
  this.roles = [];
  this.attrs = {};
  this._needs = [];
  this._facilities = {};
  this._options = options;
}

/**
 * Test if a system matches a given `criteria`.
 *
 * Examples:
 *
 *     sys.is('app server');
 *
 * @param {String} criteria
 * @return {Boolean}
 * @api private
 */
System.prototype.is = function(criteria) {
  if (criteria === '*') { return true; }
  return this.roles.indexOf(criteria) > -1 ? true : false;
}

/**
 * Declare that system needs given `component` with optional `options`.
 *
 * Both components and roles can be utilized by a system.  A role is syntactic
 * sugar for a set of components.  When compiled, all components needed by a
 * role will be substituted inline.
 *
 * Examples:
 *
 *     sys.needs('nodejs');
 *
 *     sys.needs('nodejs', { version: 0.8.18 });
 *
 * When implementing custom components, it is advised to construct them around
 * nouns, which makes the declarative DSL of Baton read clearly.  For instance,
 * the above examples read as "A system needs Node.js" and "A system needs
 * Node.js version 0.8.18."
 *
 * @param {String} name
 * @return {System} for chaining
 * @api public
 */
System.prototype.needs = function(component, options) {
  this._needs.push({ type: 'component', name: component, options: options });
  return this;
}

/**
 * Assign a `role` to the system.
 *
 * Both components and roles can be utilized by a system.  A role is syntactic
 * sugar for a set of components.  When compiled, all components needed by a
 * role will be substituted inline.
 *
 * Examples:
 *
 *     sys.assign('app server');
 *
 * @param {String} role
 * @return {System} for chaining
 * @api public
 */
System.prototype.assign = function(role) {
  this._needs.push({ type: 'role', name: role });
  return this;
}

/**
 * Connect to system.
 *
 * @return {Connection}
 * @api private
 */
System.prototype.connect = function() {
  var url = uri.parse(this.url)
    , cred = url.auth.split(':')
    , c;

  if ('ssh:' == url.protocol) {
    c = new ssh.Connection();
  } else {
    throw new Error('unsupported protocol: ' + url.protocol);
  }
  
  var cred = cred = url.auth.split(':')
    , username = cred[0]
    , password = cred[1] || this._options.password;
  
  c.connect({
    host: url.hostname,
    username: username,
    password: password
  });
  return c;
}

/**
 * Register facility `provider` for given `type`, or return `type`'s provider. 
 *
 * A system has a set of facilities, which are primitive constructs that can be
 * used to configure the system.  For example, a "package" facility allows for
 * packages to be installed, upgraded, and removed; while a "service" facility
 * allows services to be started and stopped.
 *
 * Facilities are implemented by "providers", which have knowledge of the
 * underlying system.  For example, the package facility is provided by APT on
 * Debian-based Linux distributions while RPM is used on Fedora-based
 * distributions.
 *
 * @param {String} type
 * @param {Provider} provider
 * @return {Provider|System} for chaining, or the provider
 * @api public
 */
System.prototype.facility = function(type, provider) {
  if (!provider) {
    return this._facilities[type];
  }
  this._facilities[type] = provider;
  return this;
}

/**
 * Returns a list of facilities supported by the system.
 *
 * @return {Array}
 * @api protected
 */
System.prototype.facilities = function() {
  return Object.keys(this._facilities);
}


/**
 * Expose `System`.
 */
module.exports = System;
