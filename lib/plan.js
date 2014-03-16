var debug = require('debug')('tensile');


function Plan() {
  this._seq = [];
}

Plan.prototype.push = function(item) {
  this._seq.push(item);
  return this;
}


module.exports = Plan;
