var INI = require('ini');


module.exports = function() {
  
  return function ini(data, proj) {
    var config = INI.parse(data);
    
    var keys = Object.keys(config)
      , val, i, len;
    for (i = 0, len = keys.length; i < len; ++i) {
      key = keys[i]
      val = config[key];
      
      if (typeof val == 'object') {
        var host = Object.keys(val)[0];
        proj.host(host).assign(key);
      } else if (typeof val == 'boolean') {
        proj.host(key);
      }
    }
  }
}
