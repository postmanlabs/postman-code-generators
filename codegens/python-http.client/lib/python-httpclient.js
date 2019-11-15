var _ = require('./lodash'),
  sanitize = require('./util/sanitize').sanitize,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  parseBody = require('./util/parseBody'),
  self;

/**
 * Used to parse the request headers
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getheaders (request, indentation) {
  var headerArray = request.toJSON().header,
    requestBodyMode = (request.body ? request.body.mode : 'raw'),
    headerMap;

  if (!_.isEmpty(headerArray)) {
    headerArray = _.reject(headerArray, 'disabled');
    headerMap = _.map(headerArray, function (header) {
      return `${indentation}'${sanitize(header.key, 'header', true)}': ` +
            `'${sanitize(header.value, 'header')}'`;
    });
    if (requestBodyMode === 'formdata') {
      headerMap.push(`${indentation}'Content-type': 'multipart/form-data; boundary={}'.format(boundary)`);
    }
    return `headers = {\n${headerMap.join(',\n')}\n}\n`;
  }
  if (requestBodyMode === 'formdata') {
    return `headers = {\n${indentation} 'Content-type': ` +
             '\'multipart/form-data; boundary={}\'.format(boundary) \n}\n';
  }
  return 'headers = {}\n';
}

/**
 * Generates URL's path with query string
 *
 * @param {Object} requestUrl - Postman Sdk Request's Url object
 * @returns {String} - Url path with query (no host)
 */
function getUrlPathWithQuery (requestUrl) {
  var path = requestUrl.getPath(),
    query = requestUrl.getQueryString({ ignoreDisabled: true }),
    urlPathWithQuery = '';

  urlPathWithQuery += (path === '/' ? '' : path);
  if (query !== '') {
    urlPathWithQuery += '?' + sanitize(query);
  }
  return urlPathWithQuery;
}

self = module.exports = {
  /**
     * Used to return options which are specific to a particular plugin
     *
     * @module getOptions
     *
     * @returns {Array}
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
      }
    ];
  },

  /**
    * Used to convert the postman sdk-request object in python-httpclient reuqest snippet
    *
    * @module convert
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options - Options to tweak code snippet generated in Python
    * @param  {String} options.indentType - type of indentation eg: Space / Tab (default: Space)
    * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: Space,
                                                                    default: 1 for indentType: Tab)
    * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.requestBodyTrim : whether to trim request body fields (default: false)
    * @param {Boolean} options.followRedirect : whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    */
  convert: function (request, options, callback) {
    var snippet = '',
      indentation = '',
      identity = '';

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }
    else if (!_.isFunction(callback)) {
      throw new Error('Python-Http.Client~convert: Callback is not a function');
    }
    options = sanitizeOptions(options, self.getOptions());

    identity = options.indentType === 'Tab' ? '\t' : ' ';
    indentation = identity.repeat(options.indentCount);

    snippet += 'import http.client\n';
    snippet += 'import mimetypes\n';
    snippet += `conn = http.client.HTTPSConnection("${request.url.host ? request.url.host.join('.') : ''}"`;
    snippet += request.url.port ? `, ${request.url.port}` : '';
    snippet += options.requestTimeout !== 0 ? `, timeout = ${options.requestTimeout})\n` : ')\n';
    snippet += parseBody(request.toJSON(), indentation, options.requestBodyTrim);
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
    snippet += getheaders(request, indentation);
    snippet += `conn.request("${request.method}", "${getUrlPathWithQuery(request.url)}", payload, headers)\n`;
    snippet += 'res = conn.getresponse()\n';
    snippet += 'data = res.read()\n';
    snippet += 'print(data.decode("utf-8"))';

    return callback(null, snippet);
  }
};
