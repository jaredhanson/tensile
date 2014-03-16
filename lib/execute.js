module.exports = function(plan, host, sh, cb) {
  console.log('EXEC');
  console.log(plan._seq);
  
  // TODO: unify this with procedures/apply
  
  var seq = plan._seq
    , idx = 0;
  
  function iter(err) {
    if (err) { return cb(err); }
    
    var desc = seq[idx++];
    if (!desc) { return cb(); }
    
    // TODO: add support for _include (won't have a _type)
    
    var fac = host.facility(desc._type);
    console.log('FACILITY');
    console.log(fac)
    if (!fac) { return cb(new Error("Unsupported facility '" + desc._type + "'")); }
    
    fac.read(sh, desc, function(err, state) {
      if (err) { return cb(err); }
      
      console.log('READ')
      console.log(state);
      
      fac.apply(sh, state, desc, function(err) {
        if (err) { return cb(err); }
        return cb();
      });
    });
    
  }
  iter();
}
