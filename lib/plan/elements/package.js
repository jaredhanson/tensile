var merge = require('utils-merge');


module.exports = function() {
  
  return function package(attrs) {
    var item = {};
    merge(item, attrs);
    item.name = item.name || item.package;
    item.state = item.state || 'installed';
    
    item._type = 'package';
    
    console.log(item);
    
    return item;
  }
}
