var merge = require('utils-merge');


module.exports = function() {
  
  return function package(attrs) {
    var item = {};
    merge(item, attrs);
    item.type = 'package';
    item.name = item.name || item.package;
    delete item.package;
    
    item.state = item.state || 'installed';
    
    return item;
  }
}
