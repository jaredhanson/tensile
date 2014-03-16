/**
 * Module dependencies.
 */
var uri = require('url')
  , pool = require('functionpool')
  , execute = require('../execute')
  , debug = require('debug')('tensile')


exports = module.exports = function(proj, shell, detector, plan, options) {
  options = options || {};
  
  var limit = options.limit || 5;
  
  
  return function apply(done) {
    var self = this
      , hostnames = proj.hosts()
      , hosts = [], host, i, len;
    
    for (i = 0, len = hostnames.length; i < len; i++) {
      var host = proj.host(hostnames[i]);
      hosts.push(host);
    
      // TODO: Implement support for criteria.
      /*
      for (var j = 0, jlen = criteria.length; j < jlen; j++) {
        var crit = criteria[j];
        if (sys.is(crit)) {
          debug('selected ' + sys.url);
          systems.push(sys);
        }
      }
      */
    }
    
    
    function work(host, cb) {
      debug('connecting to ' + host.url + ' ...');
      
      var url = uri.parse(host.url);
      var options = {
        host: url.hostname,
        port: url.port
      }
      if (url.auth) {
        var cred = url.auth.split(':');
        options.username = cred[0];
        options.password = cred[1];
      }
      
      shell.connect(options, function(err, sh) {
        console.log('CONNECTED!');
        console.log(err);
        
        if (err) { return cb(err); }
        
        // TODO: Introspect host, execute commands
        
        detector.detect(host, sh, function(err) {
          console.log('DETECTED!');
          console.log(err);
          
          if (err) { return cb(err); }
          
          execute(plan, host, sh, function(err) {
            console.log('EXECUTED!');
            console.log(err);
            
            if (err) { return cb(err); }
            return cb();
            
          });
          
          
        });
      });
    }
    
    pool(work, hosts, limit, function(results) {
      // TODO: Print out a report of the state of the system (or error info, if any).
      done();
    });
  }
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [];
