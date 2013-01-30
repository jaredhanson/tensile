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
 * @param {Connection} c
 * @api private
 */
function Worker(sys, c) {
  this.sys = sys;
  this.c = c;
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
    
    // Flatten the sequence of steps to be taken when applying the blueprint to
    // the system.  The flattening process merges system-specific steps with
    // steps needed by roles that are assigned to the system.
    function flatten(done) {
      var steps = self.sys._steps
        , list = [];
      
      for (var i = 0, len = steps.length; i < len; i++) {
        var step = steps[i];
        switch (step.__op__) {
          case 'role':
            role = bp.role(step.name);
            list = list.concat(role._steps);
            break;
          default:
            list.push(step);
            break;
        }
      }
      console.log('=== STEPS ===');
      console.log(list);
      done(null, list);
    }
    
    // Phase 1: During phase 1, components are used to construct a "resource
    // declaration" list.  Resource declarations represent the state a resource
    // should in after the blueprint is applied.  During this phase, resource
    // declarations may be intermediate, requiring a transform to result in
    // normal form.
    function phase1(steps, done) {
      var list = [];
      
      (function iter(i, err) {
        if (err) { return done(err); }
      
        var step = steps[i];
        if (!step) { return done(null, list); } // done
        
        if (step.__op__ == 'comp') {
          var ns = step.name.split('/')
            , cname = ns[0]
            , dname = ns.slice(1).join('/')
          
          var comp = Component.get(cname, { paths: bp.paths });
          comp.build(dname, step.options, self.sys, function(err, rdl) {
            if (err) { return done(err); }
            for (var j = 0, jlen = rdl.length; j < jlen; j++) {
              var ent = { __op__: 'resd' };
              utils.merge(ent, rdl[j]);
              list.push(ent);
            }
            iter(i + 1);
          });
        } else {
          list.push(step);
        }
      })(0);
    }
    
    // Fabricate the "system configuration definition".  This is essentially a
    // post-processing step, used to transform any intermediate resource
    // declarations.  For example, templates need to be rendered to content
    // before they can be written to a file.
    function fabricate(scd, done) {
      console.log("FABRICATE");
      console.log(scd);
      return;
      
      var fscd = [];
      
      (function iter(i, err) {
        if (err) { return done(err); }
        
        var def = scd[i];
        if (!def) { return done(null, fscd); } // done
        
        bp.fabricate(def, function(err, fdef) {
          if (err) { return done(err); }
          fscd.push(fdef);
          iter(i + 1);
        });
      })(0);
    }
    
    // Apply the system configuration to the system, bringing the system into
    // the desired state.
    function apply(scd, done) {
      //console.log('SCD: ');
      //console.log(scd);
    
      (function iter(i, err) {
        if (err) { return done(err); }
        
        var def = scd[i];
        if (!def) { return done(); } // done
        
        var fac = self.sys.facility(def.__type__);
        if (!fac) { return done(new Error("Unsupported facility '" + def.__type__ + "'")); }
        
        fac.load(self.c, def, function(err, res) {
          if (err) { return done(err); }
          
          fac.sync(self.c, res, def, function(err) {
            if (err) { return done(err); }
            iter(i + 1);
          })
          
        });
      })(0);
    }
    
    
    async.waterfall([
        flatten,
        phase1,
        fabricate,
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
