var path = require('path')
  , fs = require('fs')
  , Component = require('./component')
  , utils = require('./utils')
  , dirname = path.dirname
  , basename = path.basename
  , extname = path.extname
  , join = path.join
  , exists = fs.existsSync || path.existsSync;

function Template(name, options) {
  var engines = options.engines
    , defaultEngine = options.defaultEngine;
  
  this.name = name;
  this.root = options.root;
  var ext = this.ext = extname(name);
  this.componentPaths = options.componentPaths;
  
  if (!ext) name += (ext = this.ext = '.' + defaultEngine);
  this.engine = engines[ext] || (engines[ext] = require(ext.slice(1)));
  this.path = this.lookup(name);
}

Template.prototype.lookup = function(name) {
  var ext = this.ext
    , path;

  if (utils.isOverride(name)) {
    path = join(this.root, name.slice(1));
    if (exists(path)) return path;
  }

  // <path>.<engine>
  if (!utils.isAbsolute(name)) {
    var ns = name.split('/')
      , cname = ns[0]
      , tname = ns.slice(1).join('/')
  
    var comp = Component.get(cname, { paths: this.componentPaths });
    path = comp.resolveTemplate(tname);
  }
  if (exists(path)) return path;
  
  // TODO: Implement support for relative templates (with #)

  // <path>/index.<engine>
  path = join(dirname(path), basename(path, ext), 'index' + ext);
  if (exists(path)) return path;
};

Template.prototype.render = function(options, fn) {
  var engine = this.engine;
  
  if ('function' != typeof engine.renderFile) throw new Error('file rendering not supported by "' + this.ext + '" engine');
  engine.renderFile(this.path, options, fn);
};


module.exports = Template;
