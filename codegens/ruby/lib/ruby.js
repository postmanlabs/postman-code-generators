var _ = require('./lodash'),
  parseBody = require('./util/parseBody'),
  sanitize = require('./util/sanitize').sanitize,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  self;

/**
 * Used to parse the request headers
 *
 * @param  {Object} headers - postman SDK-request object
 * @returns {String} - request headers in the desired format
 */
function parseHeaders (headers) {
  var headerSnippet = '';
  if (!_.isEmpty(headers)) {
    headers = _.reject(headers, 'disabled');
    _.forEach(headers, function (header) {
      headerSnippet += `request["${sanitize(header.key, 'header', true)}"] = "${sanitize(header.value, 'header')}"\n`;
    });
  }
  return headerSnippet;
}

self = module.exports = {
  /**
     * Used to return options which are specific to a particular plugin
     *
     * @returns {Array}
     */
  getOptions: function () {
    return [{
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
    }];
  },

  /**
    * Used to convert the postman sdk-request object in ruby request snippet
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
      headerSnippet = '',
      methods = ['GET', 'POST', 'HEAD', 'DELETE', 'PATCH', 'PROPFIND',
        'PROPPATCH', 'PUT', 'OPTIONS', 'COPY', 'LOCK', 'UNLOCK', 'MOVE', 'TRACE'];

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    else if (!_.isFunction(callback)) {
      throw new Error('Ruby~convert: Callback is not a function');
    }
    options = sanitizeOptions(options, self.getOptions());

    identity = options.indentType === 'Tab' ? '\t' : ' ';
    indentation = identity.repeat(options.indentCount);
    // concatenation and making up the final string
    snippet = 'require "uri"\n';
    snippet += 'require "net/http"\n\n';
    if (!_.includes(methods, request.method)) {
      snippet += `class Net::HTTP::${_.capitalize(request.method)} < Net::HTTPRequest\n`;
      snippet += `${indentation}METHOD = "${request.method}"\n`;
      snippet += `${indentation}REQUEST_HAS_BODY = ${!_.isEmpty(request.body)}\n`;
      snippet += `${indentation}RESPONSE_HAS_BODY = true\n`;
      snippet += 'end\n\n';
    }
    snippet += `url = URI("${sanitize(request.url.toString(), 'url')}")\n\n`;
    if (sanitize(request.url.toString(), 'url').startsWith('https')) {
      snippet += 'https = Net::HTTP.new(url.host, url.port);\n';
      snippet += 'https.use_ssl = true\n\n';
      if (options.requestTimeout) {
        snippet += `https.read_timeout = ${Math.ceil(options.requestTimeout / 1000)}\n`;
      }
      snippet += `request = Net::HTTP::${_.capitalize(request.method)}.new(url)\n`;
      headerSnippet = parseHeaders(request.getHeaders({enabled: true}));
      if (headerSnippet !== '') {
        snippet += headerSnippet;
      }

      snippet += `${parseBody(request.toJSON(), options.trimRequestBody)}\n`;
      snippet += 'response = https.request(request)\n';
      snippet += 'puts response.read_body\n';
    }
    else {
      snippet += 'http = Net::HTTP.new(url.host, url.port);\n';
      if (options.requestTimeout) {
        snippet += `http.read_timeout = ${Math.ceil(options.requestTimeout / 1000)}\n`;
      }
      snippet += `request = Net::HTTP::${_.capitalize(request.method)}.new(url)\n`;
      if (request.body && request.body.mode === 'file' && !request.headers.has('Content-Type')) {
        request.addHeader({
          key: 'Content-Type',
          value: 'text/plain'
        });
      }
      headerSnippet = parseHeaders(request.toJSON().header);

      if (headerSnippet !== '') {
        snippet += headerSnippet;
      }
      snippet += `${parseBody(request.toJSON(), options.trimRequestBody)}\n`;
      snippet += 'response = http.request(request)\n';
      snippet += 'puts response.read_body\n';
    }

    return callback(null, snippet);
  }
};
