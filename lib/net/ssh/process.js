/**
 * Module dependencies.
 */
var events = require('events')
  , util = require('util')
  , debugio = require('debug')('baton:stdio');


/**
 * `Process` constructor.
 *
 * This class wraps `ssh2.Channel`.  It exists primarily to output debug
 * logging as well as work around an issue with `ssh2.Channel`.
 *
 * @param {ssh2.Channel} chan
 * @param {Object} options
 * @api protected
 */
function Process(chan, options) {
  events.EventEmitter.call(this);
  this._chan = chan;
  
  var self = this
    , host = options.host
    , code
    , signal;
  
  this._chan.on('data', function(data, ext) {
    debugio('[' + host + '|' + (ext === 'stderr' ? 'stderr] ' : 'stdout] ') + data);
    self.emit('data', data, ext);
  });
  this._chan.on('exit', function(c, s) {
    // NOTE: It has been observed that the underlying `ssh2.Channel` will often
    //       emit `data` events after `exit`.  As a workaround, we delay emitting
    //       `exit` until `end`, ensuring that all `data` events have been
    //       processed before `exit` is emitted.
    code = c;
    signal = s;
  });
  this._chan.on('end', function() {
    // NOTE: Likewise, it has been observed that the underlying `ssh2.Channel`
    //       will occasionally emit an `end` event before `exit`.  As a workaround,
    //       we delay until `close` to emit `exit`.
  });
  this._chan.on('close', function() {
    debugio('[' + host + '|' + 'exit] ' + code);
    self.emit('exit', code, signal);
  });
}

/**
 * Inherit from `EventEmitter`.
 */
util.inherits(Process, events.EventEmitter);


/**
 * Expose `Connection`.
 */
module.exports = Process;
