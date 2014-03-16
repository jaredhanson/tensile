var TOML = require('toml')
  , elements = require('../elements');


module.exports = function() {
  var els = elements.createElements(); 
  //var elements = new Elements();
  
  
  return function toml(data, plan, cb) {
    var config = TOML.parse(data);
    var tasks = config.task
      , idx = 0;
    
    function iter(err) {
      if (err) { return cb(err); }
      
      var task = tasks[idx++];
      if (!task) { return cb(); }
      
      els.parse(task, function(err, item) {
        if (err) { return iter(err); }
        plan.push(item);
        return iter();
      });
    }
    iter();
  }
}
