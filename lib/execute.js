module.exports = function(plan, host, sh, cb) {
  console.log('EXEC');
  console.log(plan._seq);
  
  // TODO: unify this with procedures/apply
  
  var seq = plan._seq
    , idx = 0;
  
  function iter(err) {
    if (err) { return cb(err); }
    
    var item = seq[idx++];
    if (!item) { return cb(); }
    
    switch (item._class) {
    case 'task':
      var fac = host.facility(item._type);
      console.log('FACILITY');
      console.log(fac)
      if (!fac) { return cb(new Error("Unsupported facility '" + item._type + "'")); }
      
      fac.read(sh, item, function(err, state) {
        if (err) { return cb(err); }
        
        console.log('READ')
        console.log(state);
        
        
      });
      
      break;
    
    
      
    // TODO: throw on default
    }
  }
  iter();
}
