var debug = require('debug')('tensile');


// TODO: Rename this to Initializer
function Detector() {
  this._phases = [];
}

Detector.prototype.detect = function(host, sh, cb) {
  debug('detecting host capabilities: ' + host.url);
  var stack = this._phases;
  (function iter(i, err) {
    if (err) { return cb(err); }
  
    var layer = stack[i];
    if (!layer) { return cb(); }
    
    try {
      layer(host, sh, function(e) { iter(i + 1, e); } )
    } catch (ex) {
      return cb(ex);
    }
  })(0);
}

Detector.prototype.use = function(fn) {
  this._phases.push(fn);
  return this;
}


module.exports = Detector;
