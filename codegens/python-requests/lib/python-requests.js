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
function getheaders (request, indentation) {
  var headerArray = request.toJSON().header,
    headerMap;

  if (!_.isEmpty(headerArray)) {
    headerArray = _.reject(headerArray, 'disabled');
    headerMap = _.map(headerArray, function (header) {
      return `${indentation}'${sanitize(header.key, 'header', true)}': ` +
            `'${sanitize(header.value, 'header')}'`;
    });
    return `headers = {\n${headerMap.join(',\n')}\n}\n`;
  }
  return 'headers= {}\n';
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
    * Used to convert the postman sdk-request object to python request snippet
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
      identity = '';

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    else if (!_.isFunction(callback)) {
      throw new Error('Python-Requests~convert: Callback is not a function');
    }
    options = sanitizeOptions(options, self.getOptions());

    identity = options.indentType === 'Tab' ? '\t' : ' ';
    indentation = identity.repeat(options.indentCount);
    snippet += 'import requests\n\n';
    snippet += `url = "${sanitize(request.url.toString(), 'url')}"\n\n`;

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
        return (item.type === 'file' && Array.isArray(item.src));
      });
    }
    snippet += `${parseBody(request.toJSON(), indentation, options.trimRequestBody)}`;
    if (request.body && request.body.mode === 'file' && !request.headers.has('Content-Type')) {
      request.addHeader({
        key: 'Content-Type',
        value: 'text/plain'
      });
    }
    snippet += `${getheaders(request, indentation)}\n`;
    snippet += `response = requests.request("${request.method}", url, headers=headers`;

    snippet += request.body && request.body.mode && request.body.mode === 'formdata' ?
      ', data = payload, files = files' : ', data = payload';
    snippet += !options.followRedirect ? ', allow_redirects = False' : '';
    snippet += options.requestTimeout !== 0 ? `, timeout=${options.requestTimeout}` : '';
    snippet += ')\n\n';
    snippet += 'print(response.text.encode(\'utf8\'))\n';

    callback(null, snippet);
  }
};
