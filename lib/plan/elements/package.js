var merge = require('utils-merge');


module.exports = function() {
  
  return function package(attrs) {
    var item = {};
    merge(item, attrs);
    item.state = item.state || 'installed';
    
    item._class = 'task';
    item._type = 'package';
    return item;
  }
}
