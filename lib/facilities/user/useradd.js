var util = require('util')


/**
 * Load user resource.
 *
 * User information is stored in the password file, typically located at
 * `/etc/passwd`.  This file is parsed in order to determine the current state
 * of a user.  Once loaded, the user will be addded or modified as needed (using
 * `useradd` or `usermod` respectively.
 *
 * References:
 *   - passwd(5)
 *   - [Gecos_field](http://en.wikipedia.org/wiki/Gecos_field)
 *
 * @param {Connection} conn
 * @param {Object} def
 * @param {Function} done
 * @api protected
 */
exports.load = function(conn, def, done) {
  console.log('useradd load');
  console.log(def);
  
  
  var passwdFile = '/etc/passwd'
    , command = util.format('cat "%s"', passwdFile);
  
  conn.exec(command, function(err, cmd) {
    if (err) { return done(err); }
    
    var output = '';
    
    cmd.on('data', function(data) {
      output += data;
    });
    cmd.on('exit', function(code, signal) {
      if (code !== 0) { return done(new Error('Failed to load password file "' + passwdFile + '"')); }
    
      /*
      if (code !== 0) { return done(new Error('Failed to list contents of releases directory')); }
      
      var entries = output.split('\n').filter(function(el) {
        return el.length > 0;
      });
      return remove(entries);
      */
    });
  });
  
  
}

exports.sync = function(conn, file, def, done) {
  console.log('useradd sync');
}
