/**
 * `Role` constructor.
 *
 * A role is logical set of functionality that can be fulfulled by a system.
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
  this._steps.push({ op: 'comp', params: { name: component, options: options } });
  return this;
}

Role.prototype.exec = function(fn) {
  this._steps.push({ op: 'exec', params: { fn: fn } });
  return this;
}


/**
 * Expose `Role`.
 */
module.exports = Role;
