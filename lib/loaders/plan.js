var path = require('path')
  , fs = require('fs');


function Loader() {
  this._formats = {};
}

Loader.prototype.load = function(file) {
  var ext = path.extname(file);
  
  var load = this._formats[ext];
  if (!load) { throw new Error('Unable to load plan file with extension: ' + ext); }
  
  var data = fs.readFileSync(file, 'utf8');
  load(data);
}

Loader.prototype.use = function(ext, loader) {
  if ('.' != ext[0]) { ext = '.' + ext; }
  this._formats[ext] = loader;
  return this;
}


module.exports = Loader;
