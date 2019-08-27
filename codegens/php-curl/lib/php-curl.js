var _ = require('./lodash'),
  parseBody = require('./util/parseBody'),
  sanitize = require('./util/sanitize').sanitize,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  self;

/**
 * Used to parse the request headers
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getHeaders (request, indentation) {
  var headerObject = request.getHeaders({enabled: true}),
    headerMap;

  if (!_.isEmpty(headerObject)) {
    headerMap = _.map(Object.keys(headerObject), function (key) {
      return `${indentation.repeat(2)}"${sanitize(key, 'header')}: ` +
            `${sanitize(headerObject[key], 'header')}"`;
    });
    return `${indentation}CURLOPT_HTTPHEADER => array(\n${headerMap.join(',\n')}\n${indentation}),\n`;
  }
  return '';
}

self = module.exports = {
  /**
     * Used to return options which are specific to a particular plugin
     *
     * @returns {Array}
     */
  getOptions: function () {
    return [{
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
    }];
  },

  /**
    * Used to convert the postman sdk-request object in php-curl request snippet
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options
    * @param  {String} options.indentType - type of indentation eg: Space / Tab (default: Space)
    * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: Space,
                                                                    default: 1 for indentType: Tab)
    * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.trimRequestBody : whether to trim request body fields (default: false)
    * @param {Boolean} options.followRedirect : whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    */
  convert: function (request, options, callback) {
    var snippet = '',
      indentation = '',
      identity = '',
      finalUrl;

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    else if (!_.isFunction(callback)) {
      throw new Error('Php-Curl~convert: Callback is not a function');
    }
    options = sanitizeOptions(options, self.getOptions());

    identity = options.indentType === 'Tab' ? '\t' : ' ';
    indentation = identity.repeat(options.indentCount);
    // concatenation and making up the final string
    finalUrl = request.url.toString();
    if (finalUrl !== encodeURI(finalUrl)) {
      // needs to be encoded
      finalUrl = encodeURI(finalUrl);
    }
    snippet = '<?php\n\n$curl = curl_init();\n\n';
    snippet += 'curl_setopt_array($curl, array(\n';
    snippet += `${indentation}CURLOPT_URL => "${sanitize(finalUrl, 'url')}",\n`;
    snippet += `${indentation}CURLOPT_RETURNTRANSFER => true,\n`;
    snippet += `${indentation}CURLOPT_ENCODING => "",\n`;
    snippet += `${indentation}CURLOPT_MAXREDIRS => 10,\n`;
    snippet += `${indentation}CURLOPT_TIMEOUT => ${options.requestTimeout},\n`;
    snippet += `${indentation}CURLOPT_FOLLOWLOCATION => ${options.followRedirect},\n`;
    snippet += `${indentation}CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n`;
    snippet += `${indentation}CURLOPT_CUSTOMREQUEST => "${request.method}",\n`;
    snippet += `${parseBody(request.toJSON(), options.trimRequestBody, indentation)}`;
    if (request.body && request.body.mode === 'file' && !request.headers.has('Content-Type')) {
      request.addHeader({
        key: 'Content-Type',
        value: 'text/plain'
      });
    }
    snippet += `${getHeaders(request, indentation)}`;
    snippet += '));\n\n';
    snippet += '$response = curl_exec($curl);\n\n';
    snippet += 'curl_close($curl);\n';
    snippet += 'echo $response;\n';

    return callback(null, snippet);
  }
};
