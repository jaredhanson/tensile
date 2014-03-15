var Applier = require('../applier')
  , Project = require('../project')
  , HostsLoader = require('../loaders/hosts')
  , shc = require('shc')
  , debug = require('debug')('tensile');

exports = module.exports = function apply(file, env) {
  
  debug('applying plan at %s in %s environment', file, env);
  
  var applier = new Applier();
  var project = new Project();
  var hostsLoader = new HostsLoader();
  var shellFactory = new shc.Factory();
  
  // Configure hosts loader.
  hostsLoader.use('ini', require('../loaders/hosts/ini')());
  
  // Configure shell connection factory.
  shellFactory.use(shc.ssh2());
  
  // Register application phases.
  applier.phase(require('../phases/hosts')(project, hostsLoader));
  applier.phase(require('../phases/apply')(project, shellFactory));
  
  // Perform application.
  applier.run(env, function(err) {
    if (err) {
      console.error(err.message);
      console.error(err.stack);
      return process.exit(-1);
    }
    // TODO: Output report summary to console.
  });
}
