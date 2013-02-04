var utils = require('../../utils');


function Context(component) {
  this.list = [];
}

Context.prototype.init = function(sys) {
  var self = this
    , facs = sys.facilities();
  
  for (var i = 0, len = facs.length; i < len; i++) {
    var type = facs[i]
      , fac = sys.facility(type);
    
    this[type] = resourceDecl(type).bind(this);
  }
  
  this.template = templateFn(sys.attrs);
}

function resourceDecl(type) {
  
  return function(name, opts) {
    var attrs = { name: name };
    utils.merge(attrs, opts);
    this.list.push({ type: type, attrs: attrs });
  }
}

function templateFn(attrs) {
  
  return function(name, locals) {
    var l = {};
    utils.merge(l, attrs);
    utils.merge(l, locals);
  
    return { __fn__: 'render', template: name, locals: l }
  }
}


module.exports = Context;
