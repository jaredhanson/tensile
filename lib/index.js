var Project = require('./project')
  , System = require('./system');


/**
 * Expose default singleton.
 *
 * @api public
 */
exports = module.exports = new Project();

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Export constructors.
 */
exports.Project = Project;

/**
 * Export CLI.
 *
 * @api private
 */
exports.cli = require('./cli');
