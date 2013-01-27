var baton = require('..')
  , debug = require('debug')('baton');

exports = module.exports = function apply(file, env) {
  
  debug('booting plan at %s in %s environment', file, env);
  baton.boot(file, env, function(err) {
    if (err) { throw err; }
    
    baton.apply(['*'], {}, function(err) {
      if (err) {
        console.error(err.message);
        console.error(err.stack);
        process.exit(-1);
        return;
      }
    });
  });
}
