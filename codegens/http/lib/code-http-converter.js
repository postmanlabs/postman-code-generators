let utils = require('./util');

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

  snippet = `${request.method} ${utils.getEndPoint(request)} HTTP/1.1\n`;
  snippet += `Host: ${utils.getHost(request)}\n`;
  snippet += `${utils.getHeaders(request)}\n`;
  snippet += `\n${utils.getBody(request, options.trimRequestBody)}`;

  return callback(null, snippet);
}

module.exports = {
  getOptions: function () {
    return [{
      name: 'Body trim',
      id: 'trimRequestBody',
      type: 'boolean',
      default: true,
      description: 'Trim request body fields'
    }];
  },

  convert: convert
};
