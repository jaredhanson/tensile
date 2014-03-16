var debug = require('debug')('tensile');


function Plan() {
  this._seq = [];
}

Plan.prototype.push = function(desc) {
  this._deq.push(desc);
  return this;
}


module.exports = Plan;
