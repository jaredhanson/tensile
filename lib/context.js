var HostsLoader = require('./loaders/hosts');


function Context(project) {
  this.project = project;
  this.hostsLoader = new HostsLoader();
}

Context.prototype.defaults = function() {
  this.hostsLoader.use('ini', require('./loaders/hosts/ini')());
}


/**
 * Expose `Context`.
 */
module.exports = Context;
