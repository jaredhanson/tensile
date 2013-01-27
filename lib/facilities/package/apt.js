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
    case 'present':
    case 'installed':
      pkg.install(c, def, done);
      break;
    case 'absent':
      pkg.remove(c, def, done);
      break;
    case 'purged':
      pkg.purge(c, def, done);
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

AptPackage.prototype.install = function(c, options, cb) {
  // TODO: Implement support for skipping this command if the status is
  //       already installed and the version is satisfied.

  var self = this
    , command = 'apt-get'
    , args = [ '-y', 'install', this.name ];
  
  if (options.version) {
    args.pop();
    args.push(this.name + '=' + options.version);
  }
  
  c.exec(command, args, function(err, cmd) {
    if (err) { return cb(err); }
    
    cmd.on('data', function(data, ext) {
    });
    cmd.on('exit', function(code, signal) {
      if (code !== 0) { return cb(new Error("Failed to install '" + self.name + "'")); };
      return cb();
    });
  });
}

AptPackage.prototype.remove = function(c, options, cb) {
  if (this.status == 'not-installed') { return cb(); }

  var command = 'apt-get';
  var args = [ '-y', 'remove', this.name ];
  
  c.exec(command, args, function(err, cmd) {
    if (err) { return cb(err); }
    
    cmd.on('data', function(data, ext) {
    });
    cmd.on('exit', function(code, signal) {
      if (code !== 0) { return cb(new Error("Failed to remove '" + self.name + "'")); };
      return cb();
    });
  });
};

AptPackage.prototype.purge = function(c, options, cb) {
  if (this.status == 'not-installed') { return cb(); }

  var command = 'apt-get';
  var args = [ '-y', 'purge', this.name ];
  
  c.exec(command, args, function(err, cmd) {
    if (err) { return cb(err); }
    
    cmd.on('data', function(data, ext) {
    });
    cmd.on('exit', function(code, signal) {
      if (code !== 0) { return cb(new Error("Failed to purge '" + self.name + "'")); };
      return cb();
    });
  });
};
