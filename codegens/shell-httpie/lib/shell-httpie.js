var _ = require('./lodash'),
  Helpers = require('./util/helpers'),
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  self;

const GAP = ' ',
  URLENCODED = 'urlencoded',
  FORM_DATA = 'formdata',
  RAW = 'raw',
  FILE = 'file';

self = module.exports = {
  /**
   * Used to return options which are specific to a particular plugin
   *
   * @returns {Array}
   */
  getOptions: function () {
    return [
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
      }
    ];
  },

  /**
    * Used to convert the postman sdk-request object in shell-httpie reuqest snippet
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options
    * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.followRedirect : whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    */
  convert: function (request, options, callback) {
    var snippet = '',
      parsedBody,
      parsedHeaders,
      bodyMode,
      timeout,
      url = '',
      handleRedirect = (enableRedirect) => { if (enableRedirect) { return GAP + '--follow' + GAP; } return GAP; },
      handleRequestTimeout = (time) => {
        if (time) {
          return '--timeout ' + (time / 1000) + GAP;
        }
        return '--timeout 3600' + GAP;
      };

    // check whether options was passed or not
    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    else if (!_.isFunction(callback)) { // check whether callback is a function
      throw new Error('Shell-Httpie~convert: Callback not a function');
    }

    options = sanitizeOptions(options, self.getOptions());

    Helpers.parseURLVariable(request);
    url = Helpers.addHost(request) + Helpers.addPort(request) + Helpers.addPathandQuery(request);
    timeout = options.requestTimeout;
    parsedHeaders = Helpers.addHeaders(request);

    // snippet construction based on the request body
    if (request.hasOwnProperty('body')) {
      if (request.body.hasOwnProperty('mode')) {
        bodyMode = request.body.mode;
        parsedBody = Helpers.getRequestBody(request.body[bodyMode], bodyMode);
        // handling every type of content-disposition
        switch (bodyMode) {
          case URLENCODED:
            snippet += 'http --ignore-stdin --form' + handleRedirect(options.followRedirect);
            snippet += handleRequestTimeout(timeout);
            snippet += request.method + GAP + url + ' \\\n';
            snippet += parsedBody + (parsedHeaders ? (' \\\n' + parsedHeaders) : '');
            break;

          case FORM_DATA:
            snippet += 'http --ignore-stdin --form' + handleRedirect(options.followRedirect);
            snippet += handleRequestTimeout(timeout);
            snippet += request.method + GAP + url + ' \\\n';
            snippet += parsedBody + (parsedHeaders ? (' \\\n' + parsedHeaders) : '');
            break;

          case RAW:
            if (parsedBody) {
              snippet += 'printf ' + parsedBody + '| ';
            }
            snippet += 'http ' + handleRedirect(options.followRedirect) + handleRequestTimeout(timeout);
            snippet += request.method + GAP + url + (parsedHeaders ? (' \\\n' + parsedHeaders) : '');
            break;
          case FILE:
            snippet += `cat ${parsedBody} | `;
            snippet += 'http ' + handleRedirect(options.followRedirect) + handleRequestTimeout(timeout);
            snippet += request.method + GAP + url + (parsedHeaders ? (' \\\n' + parsedHeaders) : '');
            break;
          default:
            return callback('Shell-Httpie~convert: Not a valid Content-Type in request body', null);
        }
      }
      else {
        snippet += 'http' + handleRedirect(options.followRedirect) + handleRequestTimeout(timeout);
        snippet += request.method + GAP + url + (parsedHeaders ? (' \\\n' + parsedHeaders) : '');
      }
    }
    else { // forming a request without a body
      snippet += 'http' + handleRedirect(options.followRedirect) + handleRequestTimeout(timeout);
      snippet += request.method + GAP + url + (parsedHeaders ? (' \\\n' + parsedHeaders) : '');
    }

    callback(null, snippet);
  }
};

