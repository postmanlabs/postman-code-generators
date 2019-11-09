var _ = require('./lodash'),
  parseBody = require('./util/parseBody'),
  sanitize = require('./util/sanitize').sanitize,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  self;

/**
 * Used to get the headers and put them in the desired form of the language
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getHeaders (request, indentation) {
  var headerArray = request.toJSON().header,
    headerMap;

  if (!_.isEmpty(headerArray)) {
    headerArray = _.reject(headerArray, 'disabled');
    headerMap = _.map(headerArray, function (header) {
      return `${indentation}'${sanitize(header.key, true)}' => ` +
            `'${sanitize(header.value)}'`;
    });
    return `$request->setHeaders(array(\n${headerMap.join(',\n')}\n));\n`;
  }
  return '';
}
self = module.exports = {
  /**
  * @returns {Array} plugin specific options
  */
  getOptions: function () {
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
        default: 'Space',
        availableOptions: ['Tab', 'Space'],
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
        name: 'Trim request body fields',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Remove white space and additional lines that may affect the server\'s response'
      },
      {
        name: 'Follow redirects',
        id: 'followRedirect',
        type: 'boolean',
        default: true,
        description: 'Automatically follow HTTP redirects'
      }
    ];
  },
  convert: function (request, options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }
    if (!_.isFunction(callback)) {
      throw new Error('PHP-HttpRequest-Converter: callback is not valid function');
    }
    options = sanitizeOptions(options, self.getOptions());

    var snippet, indentString;
    indentString = options.indentType === 'Tab' ? '\t' : ' ';
    indentString = indentString.repeat(options.indentCount);

    snippet = '<?php\n';
    snippet += '$request = new HttpRequest();\n';
    snippet += `$request->setUrl('${request.url.toString()}');\n`;
    snippet += `$request->setMethod(HTTP_METH_${request.method});\n`;
    if (options.requestTimeout !== 0 || !options.followRedirect) {
      snippet += '$request->setOptions(array(';
      snippet += options.requestTimeout === 0 ? '' : `'timeout' => ${options.requestTimeout}`;
      snippet += options.followRedirect ? '' : ', \'redirect\' => false';
      snippet += '));\n';
    }
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
    // add the headers to snippet
    snippet += getHeaders(request, indentString);

    // add the body to snippet
    if (!_.isEmpty(request.body)) {
      snippet += `${parseBody(request.toJSON(), indentString, options.trimRequestBody)}`;
    }
    snippet += 'try {\n';
    snippet += `${indentString}echo $request->send()->getBody();\n`;
    snippet += '} catch(HttpException $ex) {\n';
    snippet += `${indentString}echo $ex;\n}`;
    return callback(null, snippet);
  }
};
