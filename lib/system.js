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
    url = '//' + url;
  }
  options = options || {};

  this.url = url;
  this.attrs = {};
  this.roles = [];
  this._steps = [];
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
  this._steps.push({ method: 'comp', params: { name: component, options: options } });
  return this;
}

/**
 * Execute a procedure.
 *
 * Procedure functions are used to execute commands directly on a system.
 * Because they are procedural (rather than declarative, as is the case with
 * components), they have the ability to execute commands and inspect the
 * results.
 *
 * For configuration management, the declarative approach of components is
 * preferred, as it accurately reflects the desired state of a system.
 * Procedures are useful in situations where more direct, command-level access
 * is needed.
 *
 * Examples:
 *
 *     sys.exec(function(sys, conn, done) {
 *       conn.exec('whoami', function(err, cmd) {
 *         if (err) { return done(err); }
 *         
 *         cmd.on('exit', function(code, signal) {
 *           done();
 *         });
 *       });
 *     });
 *
 * @param {Function} fn
 * @return {Role} for chaining
 * @api public
 */
System.prototype.exec = function(fn) {
  this._steps.push({ method: 'proc', params: { fn: fn } });
  return this;
}

/**
 * Assign a `role` to the system.
 *
 * A role is sytactic sugar for a set of components and procedures.  When a
 * system is assigned a role, any components and procedures in that role are
 * added to the system.  This is particularly effective when dealing with
 * clusters in which many systems perform an identical function.
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
  this._steps.push({ method: 'role', params: { name: role } });
  return this;
}

/**
 * Connect to system.
 *
 * @return {Connection}
 * @api private
 */
// TODO: This can be removed, handled by apply
System.prototype.connect = function() {
  var url = uri.parse(this.url)
    , auth = url.auth || '' // TODO: Add option for default username (or just use key pairs)
    , cred = auth.split(':')
    , c;

  if ('ssh:' == url.protocol) {
    c = new ssh.Connection();
  } else {
    throw new Error('unsupported protocol: ' + url.protocol);
  }
  
  var username = cred[0]
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
