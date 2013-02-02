/**
 * Module dependencies.
 */
var events = require('events')
  , util = require('util')
  , SSHConnection = require('ssh2')
  , Process = require('./process')

/**
 * `Connection` constructor.
 *
 * @api protected
 */
function Connection() {
  events.EventEmitter.call(this);
  this._c = new SSHConnection();
  this._c.on('connect', this.emit.bind(this, 'connect'));
  this._c.on('ready', this.emit.bind(this, 'ready'));
  this._c.on('end', this.emit.bind(this, 'end'));
  this._c.on('close', this.emit.bind(this, 'close'));
  this._c.on('error', this.emit.bind(this, 'error'));
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Connection, events.EventEmitter);

/**
 * Establish an SSH connection to a system.
 *
 * @api protected
 */
Connection.prototype.connect = function(options) {
  this._host = options.host;
  this._c.connect(options);
}

/**
 * Execute a command.
 *
 * @param {String} command
 * @param {Array} args
 * @return {Process}
 * @api public
 */
Connection.prototype.exec = function(command, args, cb) {
  if (typeof args == 'function') {
    cb = args;
    args = [];
  }
  
  var cmd = command;
  for (var i = 0; i < args.length; i++) {
    cmd += ' ' + args[i];
  }
  
  console.log('[' + this._host + ']$ ' + cmd);
  var self = this;
  this._c.exec(cmd, function(err, chan) {
    if (err) { return cb(err); }
    return cb(null, new Process(chan, { host: self._host }));
  });
}

// TODO: Expose file transfer functionality in a more abstract way.
Connection.prototype.ftp = function(cb) {
  this._c.sftp(function(err, ftp) {
    if (err) { return cb(err); }
    return cb(null, ftp);
  });
}

/**
 * Disconnect the connection.
 *
 * @api public
 */
Connection.prototype.end = function() {
  this._c.end();
}


/**
 * Expose `Connection`.
 */
module.exports = Connection;
