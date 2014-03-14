/**
 * Module dependencies.
 */
var path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync; // <=0.6


exports = module.exports = function(proj, options) {
  if ('string' == typeof options) {
    options = { dirname: options };
  }
  options = options || {};
  var dirname = options.dirname || 'hosts'
    , extensions = options.extensions || [ '.ini' ];
  
  return function hosts(done) {
    var env = this.env;
    var dir = path.resolve(dirname);
    if (!existsSync(dir)) { return done(); }
    
    // load default hosts
    for (i = 0, len = extensions.length; i < len; ++i) {
      ext = extensions[i];
      file = path.join(dir, 'default' + ext);
      console.log(file);
      if (existsSync(file)) {
        this._hostsLoader.load(file, proj);
      }
    }
    
    // load environment-specific hosts
    for (i = 0, len = extensions.length; i < len; ++i) {
      ext = extensions[i];
      file = path.join(dir, env + ext);
      console.log(file)
      if (existsSync(file)) {
        this._hostsLoader.load(file, proj);
      }
    }
    
    done();
  }
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [];
