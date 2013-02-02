/**
 * `Role` constructor.
 *
 * A role is logical set of functionality that can be fulfilled by a system.
 * Common types of roles include application servers, database servers, etc.
 *
 * @param {String} name
 * @api protected
 */
function Role(name) {
  this.name = name;
  this._steps = [];
}

/**
 * Declare that role needs given `component` with optional `options`.
 *
 * Examples:
 *
 *     role.needs('nodejs');
 *
 *     role.needs('nodejs', { version: 0.8.18 });
 *
 * When implementing custom components, it is advised to construct them around
 * nouns, which makes the declarative DSL of Baton read clearly.  For instance,
 * the above examples read as "An application server needs Node.js" and
 * "An application server needs Node.js version 0.8.18."
 *
 * @param {String} name
 * @return {Role} for chaining
 * @api public
 */
Role.prototype.needs = function(component, options) {
  this._steps.push({ method: 'comp', params: { name: component, options: options } });
  return this;
}

/**
 * Execute a procedure.
 *
 * Procedure functions are used to execute commands directly on a system.
 * Because they are procedural (rather than declarative, as is the case with
 * components), they have the ability to execute commands and inspect the
 * results.
 *
 * For configuration management, the declarative approach of components is
 * preferred, as it accurately reflects the desired state of a system.
 * Procedures are useful in situations where more direct, command-level access
 * is needed.
 *
 * Examples:
 *
 *     role.exec(function(sys, conn, done) {
 *       conn.exec('whoami', function(err, cmd) {
 *         if (err) { return done(err); }
 *         
 *         cmd.on('exit', function(code, signal) {
 *           done();
 *         });
 *       });
 *     });
 *
 * @param {Function} fn
 * @return {Role} for chaining
 * @api public
 */
Role.prototype.exec = function(fn) {
  this._steps.push({ method: 'exec', params: { fn: fn } });
  return this;
}


/**
 * Expose `Role`.
 */
module.exports = Role;
