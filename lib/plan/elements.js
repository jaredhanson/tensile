function Elements() {
  this._els = {};
}

Elements.prototype.parse = function(attrs, cb) {
  // TODO: Parse items that have an explicity type.
  
  
  var self = this
    , types = Object.keys(this._els)
    , idx = 0;
  
  function iter(err, item) {
    if (err || item) { return cb(err, item); }
    
    var type = types[idx++];
    if (!type) { return cb(new Error('Unsupported task')); }

    if (!attrs[type]) { return iter(); }
    var parse = self._els[type]
      , arity = parse.length;
    
    if (arity == 2) {
      parse(attrs, iter);
    } else {
      var item = parse(attrs);
      iter(null, item);
    }
  }
  iter();
}

Elements.prototype.use = function(type, parser) {
  this._els[type] = parser;
  return this;
}


exports = module.exports = Elements;

exports.createElements = function() {
  var e = new Elements();
  e.use('package', require('./elements/package')());
  
  return e;
}
