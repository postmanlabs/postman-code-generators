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
  if (request.body && !request.headers.has('Content-Type')) {
    if (request.body.mode === 'file') {
      request.addHeader({
        key: 'Content-Type',
        value: 'text/plain'
      });
    }
    else if (request.body.mode === 'graphql') {
      request.addHeader({
        key: 'Content-Type',
        value: 'application/json'
      });
    }
  }
  // The following code handles multiple files in the same formdata param.
  // It removes the form data params where the src property is an array of filepath strings
  // Splits that array into different form data params with src set as a single filepath string
  if (request.body && request.body.mode === 'formdata') {
    let formdata = request.body.formdata;
    formdata.members.forEach((item) => {
      if (item.type === 'file' && Array.isArray(item.src)) {
        item.src.forEach((filePath) => {
          formdata.add({
            key: item.key,
            src: filePath,
            type: 'file'
          });
        });
      }
    });
    formdata.remove((item) => {
      return (item.type === 'file' && (Array.isArray(item.src) || !item.src || typeof item.src !== 'string')));
    });
  }
  snippet += `${utils.getHeaders(request)}\n`;
  snippet += `\n${utils.getBody(request, options.trimRequestBody)}`;

  return callback(null, snippet);
}

module.exports = {
  getOptions: getOptions,
  convert: convert
};
