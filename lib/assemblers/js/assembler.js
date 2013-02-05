var Context = require('./context');

module.exports = function(file, options) {
  
  return function(sys, comp, bp, cb) {
    try {
      var fn = require(file)(options);
      if (typeof fn == 'function') {
        var ctx = new Context();
        ctx.init(sys);
        fn.call(ctx, sys.attrs);
        
        
        var irdl = ctx.list
          , rdl = [];
        
        (function iter(i, err) {
          if (err) { return cb(err); }
          
          var ird = irdl[i];
          if (!ird) { return cb(null, rdl); } // done
          
          postprocess(ird, comp, bp, function(err, rd) {
            if (err) { return cb(err); }
            rdl.push(rd);
            iter(i + 1);
          });
        })(0);
      } else {
        return cb(new Error("Unable to invoke directive '" + file + "'"));
      }
    } catch (e) {
      return cb(e);
    }
  }
}


var postprocessors = [];

function postprocess(fn, comp, bp, done) {
  if (typeof fn === 'function') {
    postprocessors.push(fn);
    return this;
  }
  
  // private implementation that traverses the chain of postprocessors,
  // processing any intermediate resource declarations
  var self = this
    , ird = fn;
  
  var stack = postprocessors;
  (function iter(i, err, rd) {
    // an error or resource declaration was obtained, done
    if (err || rd) { return done(err, rd); }
  
    var layer = stack[i];
    if (!layer) { return done(null, ird); }
    
    try {
      layer(ird, comp, bp, function(e, r) { iter(i + 1, e, r); } )
    } catch(e) {
      return done(e);
    }
  })(0);
}

postprocess(require('./postprocessors/file')());
