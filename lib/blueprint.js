/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // 0.6 compat
  , async = require('async')
  , System = require('./system')
  , Role = require('./role')
  , Worker = require('./worker')
  , Template = require('./template')
  , utils = require('./utils')
  , debug = require('debug')('baton');


/**
 * `Blueprint` constructor.
 *
 * A blueprint describes how a set of systems should be configured.  This
 * includes the hostnames of the servers themselves and the set of roles
 * each system is fulfilling (app router, db server, etc.).
 *
 * After the set of systems has been declared, "plans" can be applied.  A plan
 * is a declaration of the state a system should be in.  For example, a plan
 * may provision a set of servers, deploy the latest version of an application,
 * or deprovision servers when a service is being retired.
 *
 * @api public
 */
function Blueprint() {
  this.paths = [];
  this.settings = {};

  this._systems = {};
  this._roles = {};
  this._inspectors = [];
  this._fabricators = [];
  this._engines = {};
  this._cache = {};
}

/**
 * Declare a system with the given `url` and optional `options`.
 *
 * @param {String} url
 * @param {Object} options
 * @return {System}
 * @api public
 */
Blueprint.prototype.system = function(url, options) {
  //debug('declaring system: ' + url);
  var s = (this._systems[url] = this._systems[url] || new System(url, options));
  return s;
}

/**
 * Declare a role with the given `name`.
 *
 * @param {String} name
 * @return {Role}
 * @api public
 */
Blueprint.prototype.role = function(name) {
  //debug('declaring role: ' + name);
  var r = (this._roles[name] = this._roles[name] || new Role(name));
  return r;
}

Blueprint.prototype.get =
Blueprint.prototype.set = function(setting, val) {
  if (1 == arguments.length) {
    return this.settings[setting];
  } else {
    this.settings[setting] = val;
    return this;
  }
}

Blueprint.prototype.enabled = function(setting) {
  return !!this.set(setting);
}

/**
 * Registers a function used to inspect a system.
 *
 * Inspectors are used to examine a system prior to a blueprint being applied.
 * Typically, they will register necessary facilities and set interesting
 * attributes, which are used by components to configure the system as desired.
 *
 * @param {Function} fn
 * @return {Blueprint} for chaining
 * @api public
 */
Blueprint.prototype.detect = function(fn, c, done) {
  if (typeof fn === 'function') {
    this._inspectors.push(fn);
    return this;
  }
  
  // private implementation that traverses the chain of inspectors, analyzing
  // the system
  var sys = fn;
  
  debug('inspecting system: ' + sys.url);
  var stack = this._inspectors;
  (function iter(i, err) {
    if (err) { return done(err); }
  
    var layer = stack[i];
    if (!layer) { return done(); }
    
    try {
      layer(sys, c, function(e) { iter(i + 1, e); } )
    } catch(e) {
      return done(e);
    }
  })(0);
}

Blueprint.prototype.render = function(name, options, cb) {
  if ('function' == typeof options) {
    cb = options;
    options = {};
  }
  
  var opts = {}
    , cache = this._cache
    , engines = this._engines
    , templ;
  
  // merge options._locals
  if (options._locals) utils.merge(opts, options._locals);

  // merge options
  utils.merge(opts, options);
  
  // set .cache unless explicitly provided
  opts.cache = null == opts.cache
    ? this.enabled('template cache')
    : opts.cache;

  // primed cache
  if (opts.cache) templ = cache[name];
  
  // template
  if (!templ) {
    templ = new Template(name, {
      defaultEngine: this.get('template engine'),
      root: this.get('templates'),
      engines: engines
    });

    if (!templ.path) {
      var err = new Error('Failed to lookup template "' + name + '"');
      err.templ = templ;
      return cb(err);
    }

    // prime the cache
    if (opts.cache) cache[name] = templ;
  }
  
  // render
  try {
    templ.render(opts, cb);
  } catch (err) {
    cb(err);
  }
}

Blueprint.prototype.apply = function(criteria, options, cb) {
  criteria = criteria || ['*'];
  options = options || {};
  cb = cb || function(){};
  
  debug('applying plan...');
  
  var self = this
    , systems = []
    , hosts = Object.keys(this._systems);
    
  // Select the systems that match the given criteria.
  for (var i = 0, len = hosts.length; i < len; i++) {
    var sys = this._systems[hosts[i]];
    
    for (var j = 0, jlen = criteria.length; j < jlen; j++) {
      var crit = criteria[j];
      if (sys.is(crit)) {
        debug('selected ' + sys.url);
        systems.push(sys);
      }
    }
  }
  
  
  var q = async.queue(function(sys, done) {
    debug('connecting to ' + sys.url + ' ...');
    
    var c = sys.connect()
      , report
      , err;
    c.on('connect', function() {
      debug('connected to ' + sys.url);
    
      //var worker = new Worker(sys, c);
      //worker.build(self);
    });
    c.on('ready', function() {
      debug('connection to ' + sys.url + ' ready');
      
      self.detect(sys, c, function(err) {
        // TODO: disconnect when encountering an error
        if (err) { return done(err); }
      
        var worker = new Worker(sys, c);
        worker.build(self, function(e, r) {
          if (e) {
            // TODO: Disconnect, and include this error in a report.
            console.log(e.stack);
          }
        
          report = r;
          err = e;
          c.end();
        });
      });
    });
    c.on('end', function() {
      debug('connection to ' + sys.url + ' ended');
    });
    c.on('close', function(hadError) {
      debug('connection to ' + sys.url + ' closed');
      return done(err, report);
    });
    c.on('error', function(err) {
      debug('connection to ' + sys.url + ' error');
    });
  }, options.limit || 5);
  
  q.push(systems, function(err, report) {
    if (err) {
      console.log(err);
      console.error(err.message);
      console.error(err.stack);
    }
    // TODO: Print out a report of the state of the system (or error info, if any).
  });
}


/**
 * Boot blueprint.
 *
 * A blueprint is a directory organized according to a set of conventions.
 * During boot, the environment is configured, modules are initialized, and a
 * plan is loaded.  When complete, `callback` is invoked and the blueprint can
 * be applied to a system or systems.
 *
 * @param {String} file
 * @param {String} env
 * @param {Object} options
 * @param {Function} callback
 * @api public
 */
Blueprint.prototype.boot = function(file, env, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  
  if (!existsSync(file)) { return callback(new Error('plan does not exist: ' + file)); }
  
  var self = this
    , dir = path.dirname(file);
  options.environmentsDir = options.environmentsDir || path.resolve(dir, './config/environments');
  options.initializersDir = options.initializersDir || path.resolve(dir, './config/initializers');
  
  // Setup component search paths.  By default, components are installed in
  // `./components`.  The `BATON_PATH` environment variable can be set to supply
  // additional paths.
  if (process.env['BATON_PATH']) {
    process.env['BATON_PATH'].split(':').forEach(function(p) {
      self.paths.push(p);
    });
  }
  this.paths.push(path.resolve(dir, 'components'));
  
  this.set('templates', process.cwd() + '/templates');
  this.set('template engine', 'ejs');
  
  // Register built-in inspectors.
  this.detect(require('./detectors/uname')());
  
  
  this.env = env;
  
  function environments(done) {
    var dir = options.environmentsDir
      , file;
    
    // configuration for all environments
    file = path.join(dir, 'all' + '.js');
    if (existsSync(file)) {
      debug('configuring environment: %s', 'all');
      require(file).apply(self);
    }
    // configuration for current environment
    file = path.join(dir, env + '.js');
    if (existsSync(file)) {
      debug('configuring environment: %s', env);
      require(file).apply(self);
    }
    done();
  }
  
  function initializers(done) {
    var dir = options.initializersDir;
    if (!existsSync(dir)) { return done(); }
    
    // NOTE: Sorting is required, due to the fact that no order is guaranteed
    //       by the system for a directory listing.  Sorting allows initializers
    //       to be prefixed with a number, and loaded in a pre-determined order.
    var files = fs.readdirSync(dir).sort();
    async.forEachSeries(files, function(file, next) {
      var regex = new RegExp('\\.(' + 'js' + ')$');
      if (regex.test(file)) {
        debug('requiring initializer: %s', file);
        var mod = require(path.join(dir, file));
        if (typeof mod == 'function') {
          var arity = mod.length;
          if (arity == 1) {
            // Async initializer.  Exported function will be invoked, with next
            // being called when the initializer finishes.
            mod.call(self, next);
          } else {
            // Sync initializer.  Exported function will be invoked, with next
            // being called immediately.
            mod.call(self);
            next();
          }
        } else {
          // Initializer does not export a function.  Requiring the initializer
          // is sufficient to invoke it, next immediately.
          next();
        }
      } else {
        next();
      }
    }, function(err) {
      done(err);
    });
  }
  
  function plan(done) {
    if (existsSync(file)) {
      debug('loading plan');
      require(path.resolve(dir, file)).apply(self);
    }
    done();
  }
  
  // Boot the blueprint by configuring the environment, invoking
  // initializers, and loading the plan.
  async.series([
      environments,
      initializers,
      plan
    ],
    function(err, results) {
      if (err) { return callback(err); }
      callback();
    }
  );
}


/**
 * Expose `Blueprint`.
 */
module.exports = Blueprint;
