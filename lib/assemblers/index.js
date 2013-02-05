/**
 * Export assemblers.
 *
 * Assembers assemble components into a resource declaration list (RDL).
 *
 * Currently, the only assembler is the JavaScript assembler, which executes
 * a script to generate the RDL.  However, this abstraction is in place to allow
 * other types of assemblers in the future.  For instance, a template-based
 * assembler may be implemenented with the benefit that it's ability to execute
 * arbitrary code is limited.
 */
exports.js = require('./js/assembler');
