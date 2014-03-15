/**
 * Module dependencies.
 */
var uri = require('url')
  , pool = require('functionpool')
  , debug = require('debug')('tensile')


exports = module.exports = function(proj, shell, options) {
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
    
    
    function work(sys, cb) {
      debug('connecting to ' + sys.url + ' ...');
      
      var url = uri.parse(sys.url);
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
        
        // TODO: Introspect host, execute commands
        
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
