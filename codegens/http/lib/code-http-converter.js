let utils = require('./util');

/**
 * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
 *
 * @module getOptions
 *
 * @returns {Array} Additional options specific to generation of http code snippet
 */
function getOptions () {
  return [{
    name: 'Trim request body fields',
    id: 'trimRequestBody',
    type: 'boolean',
    default: false,
    description: 'Remove white space and additional lines that may affect the server\'s response'
  }];
}

/**
 * Converts a Postman SDK request to HTTP message
 *
 * @param {Object} request - Postman SDK request
 * @param {Object} options - Options for converter
 * @param {Boolean} options.trimRequestBody - determines whether to trim the body or not
 * @param {Function} callback callback
 * @returns {Function} returns the snippet with the callback function.
 */
function convert (request, options, callback) {
  let snippet = '';
  options = utils.sanitizeOptions(options, getOptions());
  snippet = `${request.method} ${utils.getEndPoint(request)} HTTP/1.1\n`;
  snippet += `Host: ${utils.getHost(request)}\n`;
  snippet += `${utils.getHeaders(request)}\n`;
  snippet += `\n${utils.getBody(request, options.trimRequestBody)}`;

  return callback(null, snippet);
}

module.exports = {
  getOptions: getOptions,
  convert: convert
};
