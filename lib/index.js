var Blueprint = require('./blueprint')
  , System = require('./system');


exports = module.exports = new Blueprint();

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Expose constructors.
 */
exports.Blueprint = Blueprint;

/**
 * Expose CLI.
 *
 * @api private
 */
exports.cli = require('./cli');
