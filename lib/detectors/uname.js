module.exports = function() {

  return function uname(sys, conn, done) {
    conn.exec('uname -a', function(err, stream) {
      if (err) { return done(err); }
      
      stream.on('data', function(data, extended) {
      });
      stream.on('exit', function(code, signal) {
        // TODO: The output of `uname` should be parsed to determine what
        //       distribution is installed, and system facilities should be
        //       configured accordingly (apt vs rpm, etc.)
        //
        //       I'm using Ubuntu, so for the moment this is assumed in order
        //       to move on with higher-level concerns.
        sys.facility('file', require('../facilities/file/posix'));
        sys.facility('package', require('../facilities/package/apt'));
        done();
      });
    });
  }
}
