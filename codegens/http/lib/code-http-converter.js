let utils = require('./util'),
  defaultOptions = {};

/**
 * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
 *
 * @module getOptions
 *
 * @returns {Array} Additional options specific to generation of csharp-restsharp code snippet
 */
function getOptions () {
  return [{
    name: 'Body trim',
    id: 'trimRequestBody',
    type: 'boolean',
    default: true,
    description: 'Boolean denoting whether to trim request body fields'
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
  getOptions().forEach((option) => {
    defaultOptions[option.id] = {
      default: option.default,
      type: option.type
    };
    if (option.type === 'enum') {
      defaultOptions[option.id].availableOptions = option.availableOptions;
    }
  });
  options = utils.sanitizeOptions(options, defaultOptions);
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
