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
      return `${indentation}--header '${sanitize(key, 'header')}: ` +
            `${sanitize(headerObject[key], 'header')}' \\`;
    });
    return headerMap.join('\n');
  }
  return `${indentation}--header '' \\`;
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
    // options can be added for this for no certificate check and silent so no output is logged.
    // Also, place where to log the output if required.
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
        default: false,
        description: 'Trim request body fields'
      }
    ];
  },

  /**
    * Used to convert the postman sdk-request object in php-curl reuqest snippet
    *
    * @module convert
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
      options = {};
    }
    else if (!_.isFunction(callback)) {
      throw new Error('Shell-wget~convert: Callback is not a function');
    }

    options = sanitizeOptions(options, self.getOptions());

    identity = options.indentType === 'Tab' ? '\t' : ' ';
    indentation = identity.repeat(options.indentCount);
    // concatenation and making up the final string

    snippet = 'wget --no-check-certificate --quiet \\\n';
    snippet += `${indentation}--method ${request.method} \\\n`;
    // console.log(getHeaders(request, indentation));
    // Shell-wget accepts timeout in seconds (conversion from milli-seconds to seconds)
    if (options.requestTimeout > 0) {
      snippet += `${indentation}--timeout=${Math.floor(options.requestTimeout / 1000)} \\\n`;
    }
    else {
      snippet += `${indentation}--timeout=0 \\\n`;
    }
    // Shell-wget supports 20 redirects by default (without any specific options)
    if (typeof options.followRedirect === 'boolean' && !options.followRedirect) {
      snippet += `${indentation}--max-redirect=0 \\\n`;
    }
    if (request.body && request.body.mode === 'file' && !request.headers.has('Content-Type')) {
      request.addHeader({
        key: 'Content-Type',
        value: 'text/plain'
      });
    }
    snippet += `${getHeaders(request, indentation)}\n`;
    snippet += `${parseBody(request.toJSON(), options.trimRequestBody, indentation)}`;
    snippet += `${indentation}--output-document=shellWget.txt \\\n`;
    snippet += `${indentation}- '${request.url.toString()}'`;

    return callback(null, snippet);
  }
};
