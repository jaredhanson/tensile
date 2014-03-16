/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync; // <=0.6


exports = module.exports = function(file, plan, loader, options) {
  options = options || {};
  
  return function plan(done) {
    console.log('LOAD PLAN: ' + file);
    loader.load(file, plan, function(err) {
      if (err) { return done(err); }
      return done();
    });
  }
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [];
