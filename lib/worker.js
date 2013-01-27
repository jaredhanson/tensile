/**
 * Module dependencies.
 */
var async = require('async')
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

  bp.inspect(this.sys, this.c, function(err) {
    if (err) { return cb(err); }
    
    // Make an inventory of the components required for assembling a blueprint.
    // Components can be needed directly by a system, or included as a set via
    // an assigned role.
    function inventory(done) {
      var needs = self.sys._needs
        , list = [];
      
      for (var i = 0, len = needs.length; i < len; i++) {
        var need = needs[i];
        switch (need.type) {
          case 'component':
            list.push({ name: need.name, options: need.options });
            break;
          case 'role':
            role = bp.role(need.name);
            list = list.concat(role._needs);
            break;
        }
      }
      done(null, list);
    }
    
    // Assemble a "system configuration definition".  During assembly, components
    // will be used to construct a configuration in terms of underlying
    // facilities.
    function assemble(list, done) {
      var scd = [];
      
      (function iter(i, err) {
        if (err) { return done(err); }
      
        var item = list[i];
        if (!item) { return done(null, scd); } // done
        
        var ns = item.name.split('/')
          , cname = ns[0]
          , iname = ns.slice(1).join('/')
        
        var comp = Component.get(cname, { paths: bp.paths });
        comp.build(iname, item.options, self.sys, function(err, def) {
          if (err) { return done(err); }
          scd = scd.concat(def);
          iter(i + 1);
        });
      })(0);
    }
    
    // Fabricate the "system configuration definition".  This is essentially a
    // post-processing step, used to transform any intermediate resource
    // declarations.  For example, templates need to be rendered to content
    // before they can be written to a file.
    function fabricate(scd, done) {
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
      console.log('SCD: ');
      console.log(scd);
    
      (function iter(i, err) {
        if (err) { return done(err); }
        
        var def = scd[i];
        if (!def) { return done(); } // done
        
        var fac = self.sys.facility(def.typeOf);
        if (!fac) { return done(new Error("Unsupported facility '" + def.typeOf + "'")); }
        
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
        inventory,
        assemble,
        fabricate,
        apply
      ],
      function(err) {
        if (err) { return cb(err); }
        cb();
      });
  });
}


/**
 * Expose `Worker`.
 */
module.exports = Worker;
