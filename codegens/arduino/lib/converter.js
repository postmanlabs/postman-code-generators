let utils = require('./util');

/**
 * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
 *
 * @module getOptions
 *
 * @returns {Array} Additional options specific to generation of http code snippet
 */
function getOptions () {
  return [];
}

/**
 * Converts a Postman SDK request to HTTP message
 *
 * @param {Object} request - Postman SDK request
 * @param {Object} options - Options for converter
 * @param {Function} callback callback
 * @returns {Function} returns the snippet with the callback function.
 */
function convert (request, options, callback) {
  return callback(null, utils.getSnippet());
}

module.exports = {
  getOptions: getOptions,
  convert: convert
};
