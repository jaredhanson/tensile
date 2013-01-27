exports.load = function(c, def, done) {
  var command = 'dpkg';
  var args = [ '-s', def.name ];
  
  c.exec(command, args, function(err, cmd) {
    if (err) { return done(err); }
    
    var out = ''
      , pkg;
    
    cmd.on('data', function(data, ext) {
      out += data;
    });
    cmd.on('exit', function(code, signal) {
      var status = /^Status:\s+(.+)$/m
        , version = /^Version:\s+(.+)$/m
        , re;
      
      pkg = new AptPackage(def.name);
      re = status.exec(out);
      if (re) {
        if (re[1].match(/installed/)) {
          pkg.status = 'installed';
        }
      }
      re = version.exec(out);
      if (re) {
        // TODO: parse version according to Debian versioning:
        // http://manpages.ubuntu.com/manpages/natty/man5/deb-version.5.html
        
        pkg.version = re[1];
      }
      
      return done(null, pkg);
    });
  });
}

exports.sync = function(c, pkg, def, done) {
  switch (def.ensure) {
    case undefined:
    case 'installed':
      pkg.install(c, def, done);
      break;
    default:
      return done(new Error("Unknown ensure value '" + def.ensure + "'"));
  }
}


function AptPackage(name, options) {
  options = options || {};
  this.name = name;
  this.status = 'not-installed';
  this.version = null;
}

AptPackage.prototype.install = function(sys, options, cb) {
  var self = this
    , command = 'apt-get'
    , args = [ '-y', 'install', this.name ];
  
  // TODO: Add version support
  
  sys.exec(command, args, function(err, cmd) {
    if (err) { return cb(err); }
    
    cmd.on('data', function(data, ext) {
    });
    cmd.on('exit', function(code, signal) {
      if (code !== 0) { return cb(new Error("Failed to install '" + self.name + "'")); };
      return cb();
    });
  });
}

AptPackage.prototype.remove = function(sys, cb) {
  var command = 'apt-get';
  var args = [ '-y', 'remove', this._name ];
  
  // TODO: optionally exec apt-get autoremove after this
  
  sys.exec(command, args, function(err, cmd) {
    if (err) { return cb(err); }
    
    cmd.on('data', function(data, ext) {
      console.log((ext === 'stderr' ? 'STDERR: ' : 'STDOUT: ')
                  + data);
    });
    cmd.on('end', function() {
      console.log('Stream :: EOF');
    });
    cmd.on('close', function() {
      console.log('Stream :: close');
    });
    cmd.on('exit', function(code, signal) {
      console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
      //c.end();
    });
  });
};
