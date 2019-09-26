var _ = require('./lodash'),
  sanitizeOptions = require('./util').sanitizeOptions,

  parseRequest = require('./parseRequest');

/**
 * retuns snippet of nodejs(unirest) by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options
 * @returns {String} - nodejs(unirest) code snippet for given request object
 */
function makeSnippet (request, indentString, options) {
  var snippet = 'var unirest = require(\'unirest\');\n';

  snippet += `var req = unirest('${request.method}', '${request.url.toString()}')\n`;
  if (request.body && request.body.mode === 'file' && !request.headers.has('Content-Type')) {
    request.addHeader({
      key: 'Content-Type',
      value: 'text/plain'
    });
  }

  snippet += parseRequest.parseHeader(request, indentString);

  if (request.body) {
    snippet += parseRequest.parseBody(request.body.toJSON(), indentString, options.trimRequestBody);
  }
  if (options.requestTimeout) {
    snippet += indentString + `.timeout(${options.requestTimeout})`;
  }
  if (options.followRedirect === false) {
    snippet += indentString + '.followRedirect(false)\n';
  }

  snippet += indentString + '.end(function (res) { \n';
  snippet += indentString.repeat(2) + 'if (res.error) throw new Error(res.error); \n';
  snippet += indentString.repeat(2) + 'console.log(res.raw_body);\n';
  snippet += indentString + '});\n';

  return snippet;
}

/**
 * Used to get the options specific to this codegen
 *
 * @returns {Array} - Returns an array of option objects
 */
function getOptions () {
  return [
    {
      name: 'Set indentation count',
      id: 'indentCount',
      type: 'positiveInteger',
      default: 2,
      description: 'Set the number of indentation characters to add per code level'
    },
    {
      name: 'Set indentation type',
      id: 'indentType',
      type: 'enum',
      availableOptions: ['Tab', 'Space'],
      default: 'Space',
      description: 'Select the character used to indent lines of code'
    },
    {
      name: 'Set request timeout',
      id: 'requestTimeout',
      type: 'positiveInteger',
      default: 0,
      description: 'Set number of milliseconds the request should wait for a response' +
    ' before timing out (use 0 for infinity)'
    },
    {
      name: 'Follow redirects',
      id: 'followRedirect',
      type: 'boolean',
      default: true,
      description: 'Automatically follow HTTP redirects'
    },
    {
      name: 'Trim request body fields',
      id: 'trimRequestBody',
      type: 'boolean',
      default: false,
      description: 'Remove white space and additional lines that may affect the server\'s response'
    }
  ];
}

/**
 * Converts Postman sdk request object to nodejs(unirest) code snippet
 *
 * @param {Object} request - postman-SDK request object
 * @param {Object} options
 * @param {String} options.indentType - type for indentation eg: Space, Tab
 * @param {String} options.indentCount - number of spaces or tabs for indentation.
 * @param {Boolean} options.followRedirect - whether to enable followredirect
 * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not
 * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
 * @param {Function} callback - callback function with parameters (error, snippet)
 */
function convert (request, options, callback) {
  if (!_.isFunction(callback)) {
    throw new Error('Nodejs-Unirest-Converter: callback is not valid function');
  }
  options = sanitizeOptions(options, getOptions());

  //  String representing value of indentation required
  var indentString;

  indentString = options.indentType === 'Tab' ? '\t' : ' ';
  indentString = indentString.repeat(options.indentCount);

  return callback(null, makeSnippet(request, indentString, options));
}

module.exports = {
  convert: convert,
  getOptions: getOptions
};
