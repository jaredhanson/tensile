var Applier = require('../applier')
  , Project = require('../project')
  , Plan = require('../plan')
  , Detector = require('../detector')
  , HostsLoader = require('../loaders/hosts')
  , PlanLoader = require('../plan/loader')
  , shc = require('shc')
  , debug = require('debug')('tensile');

exports = module.exports = function apply(file, env) {
  
  debug('applying plan at %s in %s environment', file, env);
  
  var applier = new Applier();
  var project = new Project();
  var plan = new Plan();
  var hostsLoader = new HostsLoader();
  var planLoader = new PlanLoader();
  var shellFactory = new shc.Factory();
  var detector = new Detector();
  
  // Configure hosts loader.
  hostsLoader.use('ini', require('../loaders/hosts/ini')());
  
  // Configure plan loader.
  planLoader.use('toml', require('../plan/formats/toml')());
  
  // Configure shell connection factory.
  shellFactory.use(shc.ssh2());
  
  // Configure host detector.
  detector.use(require('../detectors/uname')());
  detector.use(require('tensile-file-unix')());
  detector.use(require('tensile-apt')());
  
  // Register application phases.
  applier.phase(require('../phases/hosts')(project, hostsLoader));
  applier.phase(require('../phases/plan')(file, plan, planLoader));
  applier.phase(require('../phases/apply')(project, shellFactory, detector, plan));
  
  // Perform application.
  applier.run(env, function(err) {
    if (err) {
      console.error(err.message);
      console.error(err.stack);
      return process.exit(-1);
    }
    // TODO: Output report summary to console.
    // TODO: Close SSH connections.
    console.log('DONE!')
  });
}
