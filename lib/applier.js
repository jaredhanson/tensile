var bootable = require('bootable');


function Applier() {
  this._initializer = new bootable.Initializer();
}

Applier.prototype.phase = function(fn) {
  this._initializer.phase(fn);
  return this;
};

Applier.prototype.run = function(env, cb) {
  if (typeof env == 'function') {
    cb = env;
    env = undefined;
  }
  env = env || process.env.NODE_ENV || 'development';
  
  this.env = env;
  this._initializer.run(cb, this);
};


/**
 * Expose `Applier`.
 */
module.exports = Applier;
