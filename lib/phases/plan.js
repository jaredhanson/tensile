/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync; // <=0.6


exports = module.exports = function(file, loader, options) {
  options = options || {};
  
  return function plan() {
    console.log('LOAD PLAN: ' + file);
    
    loader.load(file);
    
  }
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [];
