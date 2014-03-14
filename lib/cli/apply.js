var Applier = require('../applier')
  , Project = require('../project')
  , HostsLoader = require('../loaders/hosts')
  , debug = require('debug')('tensile');

exports = module.exports = function apply(file, env) {
  
  debug('applying plan at %s in %s environment', file, env);
  
  var applier = new Applier();
  var project = new Project();
  var hostsLoader = new HostsLoader();
  
  // Configure hosts loader.
  hostsLoader.use('ini', require('../loaders/hosts/ini')());
  
  // Register application phases.
  applier.phase(require('../boot/hosts')(project, hostsLoader));
  
  
  applier.run(env, function(err) {
    if (err) {
      console.error(err.message);
      console.error(err.stack);
      return process.exit(-1);
    }
    // TODO: Output report summary to console.
  });
}
