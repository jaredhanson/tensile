var TOML = require('toml');


module.exports = function() {
  
  return function toml(data) {
    var plan = TOML.parse(data);
    
    console.log(plan);
    
  }
}
