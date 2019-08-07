var _ = require('./lodash'),

  parseRequest = require('./parseRequest'),
  sanitize = require('./util').sanitize,
  sanitizeOptions = require('./util').sanitizeOptions;

/**
 * retuns snippet of nodejs(request) by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options
 * @returns {String} - nodejs(request) code snippet for given request object
 */
function makeSnippet (request, indentString, options) {
  var snippet = 'var request = require(\'request\');\n',
    optionsArray = [];

  snippet += 'var fs = require(\'fs\');\n';
  snippet += 'var options = {\n';

  /**
     * creating string to represent options object using optionArray.join()
     * example:
     *  options: {
     *      method: 'GET',
     *      url: 'www.google.com',
     *      timeout: 1000
     *  }
     */
  optionsArray.push(indentString + `'method': '${request.method}'`);
  optionsArray.push(indentString + `'url': '${sanitize(request.url.toString())}'`);

  optionsArray.push(parseRequest.parseHeader(request, indentString));

  if (request.body && request.body[request.body.mode]) {
    optionsArray.push(
      indentString + parseRequest.parseBody(request.body.toJSON(), indentString, options.trimRequestBody)
    );
  }
  if (options.requestTimeout) {
    optionsArray.push(indentString + `timeout: ${options.requestTimeout},`);
  }
  if (options.followRedirect === false) {
    optionsArray.push(indentString + 'followRedirect: false');
  }
  snippet += optionsArray.join(',\n') + '\n';
  snippet += '};\n';

  snippet += 'request(options, function (error, response) { \n';
  snippet += indentString + 'if (error) throw new Error(error);\n';
  snippet += indentString + 'console.log(response.body);\n';
  snippet += '});\n';

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
      name: 'Indent count',
      id: 'indentCount',
      type: 'positiveInteger',
      default: 2,
      description: 'Number of indentation characters to add per code level'
    },
    {
      name: 'Indent type',
      id: 'indentType',
      type: 'enum',
      availableOptions: ['Tab', 'Space'],
      default: 'Space',
      description: 'Character used for indentation'
    },
    {
      name: 'Request timeout',
      id: 'requestTimeout',
      type: 'positiveInteger',
      default: 0,
      description: 'How long the request should wait for a response before timing out (milliseconds)'
    },
    {
      name: 'Follow redirect',
      id: 'followRedirect',
      type: 'boolean',
      default: true,
      description: 'Automatically follow HTTP redirects'
    },
    {
      name: 'Body trim',
      id: 'trimRequestBody',
      type: 'boolean',
      default: true,
      description: 'Trim request body fields'
    }
  ];
}

/**
 * Converts Postman sdk request object to nodejs request code snippet
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
    throw new Error('NodeJS-Request-Converter: callback is not valid function');
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
