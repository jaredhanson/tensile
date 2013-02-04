/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // 0.6 compat
  , builders = require('./builders')
  , utils = require('./utils')
  , debug = require('debug')('baton')
  , debugl = require('debug')('baton:load');

/**
 * `Component` constructor.
 *
 * A component represents an individual "part" or "piece" of a system.  Typical
 * examples of a component are a server (such as Apache), a language runtime
 * (such as Node.js), or some set of configuration files (such as an Apache
 * Virtual Host).
 *
 * A component declares configuration in terms of underlying facilities provided
 * by a system.  For example, "package" and "service" are facilities for
 * installing packages and starting services, respectively.  A component also has
 * access to attributes of a system, which can be used to tailor configuration
 * options as necessary.
 *
 * When implementing custom components, it is advised to construct them around
 * nouns, which makes the declarative DSL of Baton read clearly.
 *
 * @param {System} sys
 * @param {Connection} c
 * @api private
 */
function Component(name, path) {
  this.name = name;
  this.path = path;
}

Component.prototype.build = function(directive, options, sys, bp, cb) {
  directive = directive || 'default';
  options = options || {};

  var file = this.resolveDirective(directive);
  var builder = new builders.JSBuilder(file, options);
  builder.build(sys, directive, this, bp, cb);
}

Component.prototype.resolveDirective = function(name) {
  var dpath = path.join(this.path, 'directives', name) + '.js';
  return dpath;
}

Component.prototype.resolveTemplate = function(name) {
  var tpath = path.join(this.path, 'templates', name);
  return tpath;
}

/**
 * Expose `Component`.
 */
module.exports = Component;
