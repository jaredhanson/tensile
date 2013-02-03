/**
 * Module dependencies.
 */
var async = require('async')
  , utils = require('./utils')
  , Component = require('./component')
  , debug = require('debug')('baton');


/**
 * `Worker` constructor.
 *
 * A worker is responsible for applying a blueprint to a system, bringing it to
 * a consistent state of configuration.
 *
 * @param {System} sys
 * @param {Connection} conn
 * @api private
 */
function Worker(sys, conn) {
  this.sys = sys;
  this.conn = conn;
}

/**
 * Build a blueprint.
 *
 * @param {Blueprint} bp
 * @param {Function} cb
 * @api private
 */
Worker.prototype.build = function(bp, cb) {
  cb = cb || function(){};

  var self = this;
    
  // Construct the sequence of steps to be taken when applying the blueprint to
  // the system.  The flattening process merges system-specific steps and steps
  // from assigned roles into a single sequence.
  //
  // After this step, any intermediate `role` methods will have been transformed
  // to constituent `comp` and `exec` methods.
  function sequence(done) {
    var steps = self.sys._steps
      , list = [];
    
    for (var i = 0, len = steps.length; i < len; i++) {
      var step = steps[i];
      switch (step.method) {
        case 'role':
          role = bp.role(step.params.name);
          list = list.concat(role._steps);
          break;
        default:
          list.push(step);
          break;
      }
    }
    done(null, list);
  }
  
  // Assemble a resource declaration list (RDL) from any needed components.
  // Resource declarations represent the state a resource should in after the
  // blueprint is applied.
  //
  // After this step, any intermediate `comp` methods will have been transformed
  // to (potentially multiple) `resd` methods.
  function assemble(steps, done) {
    var list = [];
    
    (function iter(i, err) {
      if (err) { return done(err); }
    
      var step = steps[i];
      if (!step) { return done(null, list); } // done
      
      if (step.method == 'comp') {
        var ns = step.params.name.split('/')
          , cname = ns[0]
          , dname = ns.slice(1).join('/')
        
        var comp = Component.get(cname, { paths: bp.paths });
        comp.build(dname, step.params.options, self.sys, bp, function(err, rdl) {
          if (err) { return done(err); }
          
          for (var j = 0, jlen = rdl.length; j < jlen; j++) {
            list.push({ method: 'resd', params: rdl[j] });
          }
          iter(i + 1);
        });
      } else {
        list.push(step);
        iter(i + 1);
      }
    })(0);
  }
  
  function compile(steps, done) {
    var list = [];
    
    for (var i = 0, len = steps.length; i < len; i++) {
      var step = steps[i];
      console.log(step);
      switch (step.method) {
        case 'resd':
          var rd = step.params;
          var proc = require('./procedures/apply')(rd.type, rd.attrs);
          list.push({ method: 'exec', params: { fn: proc } });
          break;
        default:
          list.push(step);
          break;
      }
    }
    done(null, list);
  }
  
  // Apply the system configuration to the system, bringing the system into
  // the desired state.
  function apply(steps, done) {
    console.log('STEPS: ');
    console.log(steps);
    //return;
  
    (function iter(i, err) {
      if (err) { return done(err); }
      
      var step = steps[i];
      if (!step) { return done(); } // done
      
      if (step.method == 'resd') {
        var rd = step.params;
      
        var fac = self.sys.facility(rd.type);
        if (!fac) { return done(new Error("Unsupported facility '" + rd.type + "'")); }
        
        fac.load(self.conn, rd.attrs, function(err, res) {
          if (err) { return done(err); }
          
          fac.sync(self.conn, res, rd.attrs, function(err) {
            if (err) { return done(err); }
            iter(i + 1);
          })
          
        });
      } else if (step.method == 'exec') {
        step.params.fn(self.sys, self.conn, function(err) {
          if (err) { return done(err); }
          iter(i + 1);
        });
      }
    })(0);
  }
  
  
  async.waterfall([
      sequence,
      assemble,
      compile,
      apply
    ],
    function(err) {
      if (err) { return cb(err); }
      cb();
    });
}


/**
 * Expose `Worker`.
 */
module.exports = Worker;
