module.exports = function(type, attrs) {

  return function(sys, conn, done) {
    var fac = sys.facility(type);
    if (!fac) { return done(new Error("Unsupported facility '" + type + "'")); }
        
    fac.load(conn, attrs, function(err, res) {
      if (err) { return done(err); }
          
      fac.sync(conn, res, attrs, function(err) {
        if (err) { return done(err); }
        return done();
      });    
    });
  }
}
