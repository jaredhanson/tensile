/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync; // <=0.6


exports = module.exports = function(file, p, loader, options) {
  options = options || {};
  
  return function plan(done) {
    loader.load(file, p, function(err) {
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
