/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // 0.6 compat
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

Component.get = function(name, options) {
  var cached = Component._registry[name];
  if (cached) { return cached; }
  
  debugl('searching for component ' + name + ' ...');
  var paths = options.paths || [];
  for (var i = 0, len = paths.length; i < len; i++) {
    var dir = path.join(paths[i], name);
    debugl('  at: ' + dir);
    if (existsSync(dir)) {
      var c = new Component(name, dir);
      Component._registry[name] = c;
      return c;
    }
  }
  
  throw new Error("Cannot find component '" + name + "'");
}

Component._registry = {};

Component.prototype.build = function(instr, options, sys, cb) {
  var ipath = path.join(this.path, 'instructions', instr || 'default') + '.js';
  try {
    var ifn = require(ipath)(options);
    if (typeof ifn == 'function') {
      var ctx = new InstructionContext();
      ctx.init(sys);
      ifn.call(ctx, sys.attrs);
      
      return cb(null, ctx.list);
    } else {
      return cb(new Error("Unable to invoke instructions '" + this.name + "/" + (instr || 'default') + "'"));
    }
  } catch (e) {
    return cb(e);
  }
}

/**
 * Expose `Component`.
 */
module.exports = Component;


function InstructionContext() {
  this.list = [];
}

InstructionContext.prototype.init = function(sys) {
  var self = this
    , facs = sys.facilities();
  
  for (var i = 0, len = facs.length; i < len; i++) {
    var type = facs[i]
      , fac = sys.facility(type);
    
    this[type] = function(name, opts) {
      var def = { typeOf: type };
      if (fac.compile) {
        var copts = fac.compile(name, opts);
        utils.merge(def, copts);
      } else {
        utils.merge(def, { name: name });
        utils.merge(def, opts);
      }
      this.list.push(def);
    }
  }
}
