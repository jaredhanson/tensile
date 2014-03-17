var merge = require('utils-merge');


module.exports = function() {
  
  return function file(attrs) {
    var item = {};
    merge(item, attrs);
    item.type = 'file';
    item.dest = item.dest || item.file;
    delete item.dest;
    
    console.log(item);
    
    return item;
  }
}
