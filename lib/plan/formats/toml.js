var TOML = require('toml');


module.exports = function() {
  
  return function toml(data, plan, cb) {
    var config = TOML.parse(data);
    
    console.log(config);
    
    var tasks = config.task
      , idx = 0;
    
    function iter(err) {
      var task = tasks[idx++];
      
      if (!task) { console.log('DONE'); return cb(); }
      
      iter();
      
    }
    iter();
  }
}
