/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync; // <=0.6


exports = module.exports = function(proj, loader, options) {
  if ('string' == typeof options) {
    options = { basename: options };
  }
  options = options || {};
  var basename = options.basename || 'hosts'
    , exts = options.extensions || [ '.ini' ]
    , ext, i, len, file;
  
  return function hosts() {
    var base = path.resolve(basename);
    var env = this.env;
    
    // load hosts
    for (i = 0, len = exts.length; i < len; ++i) {
      ext = exts[i];
      file = base + ext;
      if (existsSync(file)) {
        loader.load(file, proj);
        break;
      }
    }
    
    // load environment-specific hosts
    if (!existsSync(base)) { return; }
    
    for (i = 0, len = exts.length; i < len; ++i) {
      ext = exts[i];
      file = path.join(base, env + ext);
      if (existsSync(file)) {
        loader.load(file, proj);
        break;
      }
    }
  }
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [];
