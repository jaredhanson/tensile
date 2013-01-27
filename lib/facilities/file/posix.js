exports.load = function(c, def, done) {
  var command = 'stat';
  var args = [ def.name ];
  
  c.exec(command, args, function(err, cmd) {
    if (err) { return done(err); }
    
    var out = '';
    
    cmd.on('data', function(data, ext) {
      out += data;
    });
    cmd.on('exit', function(code, signal) {
      var file = new POSIXFile(def.name);
      if (code === 1) { return done(null, file); }
      
      var size = /$\s+Size:\s+(\d+)/m
        , type = /\sIO Block:\s+\d+\s+(.+)$/m
        , modify = /^Modify:\s+(.+)$/m
        , re;
      
      re = type.exec(out);
      if (re) {
        if (re[1].match(/regular file/)) {
          file.type = 'file';
        }
      }
      re = size.exec(out);
      if (re) {
        file.size = parseInt(re[1]);
      }
      
      return done(null, file);
    });
  });
}

exports.sync = function(c, file, def, done) {
  switch (def.ensure) {
    case undefined:
    case 'present':
    case 'file':
      file.write(c, def, done);
      break;
    case 'directory':
      break;
    case 'link':
    case 'symlink':
      break;
    case 'absent':
      break;
    default:
      return done(new Error("Unknown ensure value '" + def.ensure + "'"));
  }
}


function POSIXFile(path, options) {
  options = options || {};
  this.path = path;
  this.type = null;
  this.size = null;
}

POSIXFile.prototype.write = function(c, options, cb) {
  var self = this;
  
  c.ftp(function(err, ftp) {
    if (err) { return cb(err); }
    
    // FIXME: This event doesn't seem to be emitted by `ssh2.SFTP`.
    ftp.on('end', function() {
    });
  
    var ws = ftp.createWriteStream(self.path);
    ws.on('close', function() {
      // FIXME: Invoking `end` does not seem to trigger the `end` event (see above).
      //ftp.end();
      return cb();
    });
    ws.on('error', function(err) {
      return cb(err);
    });
    
    ws.write('Hello World!');
    ws.end();
  });  
}
