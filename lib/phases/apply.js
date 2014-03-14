/**
 * Module dependencies.
 */
var pool = require('functionpool')
  , shc = require('shc')
  , debug = require('debug')('tensile')


exports = module.exports = function(proj, options) {
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
      console.log('DO WORK!');
      console.log(sys);
      
      debug('connecting to ' + sys.url + ' ...');
      
      
      
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
