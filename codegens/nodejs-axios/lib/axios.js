const _ = require('./lodash'),
  parseRequest = require('./parseRequest'),
  sanitize = require('./util').sanitize,
  sanitizeOptions = require('./util').sanitizeOptions;

/**
 * retuns snippet of nodejs(axios) by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options
 * @returns {String} - nodejs(axios) code snippet for given request object
 */
function makeSnippet (request, indentString, options) {
  var snippet = 'const axios = require(\'axios\');\n',
    configArray = [],
    postFormData = [];

  snippet += 'var fs = require(\'fs\')\n';
  snippet += 'var FormData = require(\'form-data\')\n';
  

  /**
     * creating string to represent options object using optionArray.join()
     * example:
     *  config: {
     *      method: 'get',
     *      url: 'www.google.com',
     *      timeout: 1000
     *  }
     */
  configArray.push(indentString + `'method': '${request.method.toLowerCase()}'`);
  configArray.push(indentString + `'url': '${sanitize(request.url.toString())}'`);

  configArray.push(parseRequest.parseHeader(request, indentString));
  if (options.requestTimeout) {
    configArray.push(indentString + `timeout: ${options.requestTimeout},`);
  }
  if (options.followRedirect === false) {
    // setting the maxRedirects to 0 will disable any redirects.
    configArray.push(indentString + 'maxRedirects: 0');
  }
  if (request.body && request.body[request.body.mode]) {
    const body = request.body.toJSON()
    if(body.mode === 'formdata' || body.mode === 'file') {
      const formData = parseRequest.constructFormDataObject(body[body.mode], indentString, options.trimRequestBody)
      postFormData.push(formData)
      configArray.push(indentString + 'data: formData')
    }else{
      configArray.push(
        parseRequest.parseBody(request.body.toJSON(), indentString, options.trimRequestBody)
      );
    }
    
  }
  snippet += postFormData.join('\n') + '\n';
  snippet += 'const config = {\n';
  snippet += configArray.join(',\n') + '\n';
  snippet += '}\n';
  snippet += 'axios(config)\n';
  snippet += '.then(function (response) {\n';
  snippet += indentString + 'console.log(JSON.stringify(response.data));\n';
  snippet += '})\n';
  snippet += '.catch(function (error) {\n';
  snippet += indentString + 'console.log(error);\n';
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
 * Converts Postman sdk request object to nodejs axios code snippet
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
    throw new Error('NodeJS-Axios-Converter: callback is not valid function');
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
