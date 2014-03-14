/**
 * Module dependencies.
 */


exports = module.exports = function(proj, options) {
  options = options || {};
  
  return function apply() {
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
    
    
    
  }
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [];
