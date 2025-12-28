const {
    sanitize,
    sanitizeOptions,
    getUrlStringfromUrlObject,
    addFormParam,
    form,
    shouldAddHttpMethod,
    getAuthFlags
  } = require('./util'),
  _ = require('./lodash');

var self;

/**
 * Initialize options and extract values
 *
 * @param {Object} options - Sanitized options object
 * @param {Object} request - The request object
 * @returns {Object} Extracted option values
 */
function initializeOptions (options, request) {
  const quoteType = options.quoteType === 'single' ? '\'' : '"',
    url = getUrlStringfromUrlObject(request.url, quoteType);

  let indent;
  if (options.multiLine) {
    indent = options.indentType === 'Tab' ? '\t' : ' ';
    indent = ' ' + options.lineContinuationCharacter + '\n' + indent.repeat(options.indentCount); // eslint-disable-line max-len
  }
  else {
    indent = ' ';
  }

  return {
    redirect: options.followRedirect,
    maxRedirects: options.maxRedirects,
    timeout: options.requestTimeoutInSeconds,
    multiLine: options.multiLine,
    format: options.longFormat,
    trim: options.trimRequestBody,
    quiet: options.quiet,
    debug: options.debug,
    followOriginalHttpMethod: options.followOriginalHttpMethod,
    quoteType,
    url,
    indent
  };
}

/**
 * Build the base command with method and URL
 *
 * @param {Object} request - The request object
 * @param {Object} opts - Extracted options
 * @param {Object} options - Original options object
 * @returns {string} Base snippet
 */
function buildBaseCommand (request, opts, options) {
  let snippet = 'postman request';

  if (shouldAddHttpMethod(request, options)) {
    snippet += ` ${request.method}`;
  }

  snippet += ` ${opts.quoteType + opts.url + opts.quoteType}`;

  return snippet;
}

/**
 * Add quiet, debug and timeout flags to snippet
 *
 * @param {string} snippet - Current snippet
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addQuietAndTimeout (snippet, opts) {
  if (opts.quiet) {
    snippet += `${opts.indent}${form('-q', opts.format)}`;
  }
  if (opts.debug) {
    snippet += `${opts.indent}--debug`;
  }
  if (opts.timeout > 0) {
    snippet += `${opts.indent}--timeout ${opts.timeout}`;
  }
  return snippet;
}

/**
 * Set default Content-Type header if needed
 *
 * @param {Object} request - The request object
 */
function setDefaultContentType (request) {
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
}

/**
 * Add headers to snippet
 *
 * @param {string} snippet - Current snippet
 * @param {Object} request - The request object
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addHeaders (snippet, request, opts) {
  let headersData = request.toJSON().header;
  if (headersData) {
    headersData = _.reject(headersData, 'disabled');
    _.forEach(headersData, (header) => {
      if (!header.key) {
        return;
      }
      snippet += opts.indent +
        `${form('-H', opts.format)} ${opts.quoteType}${sanitize(header.key, true, opts.quoteType)}`;
      snippet += `: ${sanitize(header.value, false, opts.quoteType)}${opts.quoteType}`;
    });
  }
  return snippet;
}

/**
 * Process formdata to handle multiple files
 *
 * @param {Object} request - The request object
 */
function processFormData (request) {
  // The following code handles multiple files in the same formdata param.
  // It removes the form data params where the src property is an array of filepath strings
  // Splits that array into different form data params with src set as a single filepath string
  if (request.body && request.body.mode === 'formdata') {
    let formdata = request.body.formdata,
      formdataArray = [];
    formdata.members.forEach((param) => {
      let key = param.key,
        type = param.type,
        disabled = param.disabled,
        contentType = param.contentType;
      if (type === 'file') {
        if (typeof param.src !== 'string') {
          if (Array.isArray(param.src) && param.src.length) {
            param.src.forEach((filePath) => {
              addFormParam(formdataArray, key, param.type, filePath, disabled, contentType);
            });
          }
          else {
            addFormParam(formdataArray, key, param.type, '/path/to/file', disabled, contentType);
          }
        }
        else {
          addFormParam(formdataArray, key, param.type, param.src, disabled, contentType);
        }
      }
      else {
        addFormParam(formdataArray, key, param.type, param.value, disabled, contentType);
      }
    });
    request.body.update({
      mode: 'formdata',
      formdata: formdataArray
    });
  }
}

/**
 * Add raw body to snippet
 *
 * @param {string} snippet - Current snippet
 * @param {Object} body - Body data
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addRawBody (snippet, body, opts) {
  let rawBody = body.raw.toString(),
    sanitizedBody = sanitize(rawBody, opts.trim, opts.quoteType);

  if (!opts.multiLine) {
    try {
      sanitizedBody = JSON.stringify(JSON.parse(sanitizedBody));
    }
    catch (e) {
      // Do nothing
    }
  }

  snippet += opts.indent + `${form('-d', opts.format)} ${opts.quoteType}${sanitizedBody}${opts.quoteType}`;

  return snippet;
}

/**
 * Add formdata body to snippet
 *
 * @param {string} snippet - Current snippet
 * @param {Object} body - Body data
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addFormDataBody (snippet, body, opts) {
  _.forEach(body.formdata, function (data) {
    if (data.disabled) {
      return;
    }

    if (data.type === 'file') {
      const sanitizedSrc = sanitize(data.src, opts.trim, '"', true),
        wrappedSrc = `@"${sanitizedSrc}"`,
        finalSrc = sanitize(wrappedSrc, opts.trim, opts.quoteType, opts.quoteType === '"');
      snippet += ` ${opts.quoteType}${sanitize(data.key, opts.trim, opts.quoteType)}=${finalSrc}`;
      snippet += opts.quoteType;
    }
    else {
      const sanitizedValue = sanitize(data.value, opts.trim, '"', true),
        finalValue = sanitize(sanitizedValue, opts.trim, opts.quoteType, opts.quoteType === '"');
      snippet += `${opts.indent} ${form('-f', opts.format)} ` +
        `${opts.quoteType}${sanitize(data.key, opts.trim, opts.quoteType)}=${finalValue}`;
      snippet += opts.quoteType;
    }
  });
  return snippet;
}

/**
 * Add body data to snippet based on body mode
 *
 * @param {string} snippet - Current snippet
 * @param {Object} request - The request object
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addBodyData (snippet, request, opts) {
  if (!request.body) {
    return snippet;
  }

  const body = request.body.toJSON();

  if (_.isEmpty(body)) {
    return snippet;
  }

  switch (body.mode) {
    case 'raw':
      snippet = addRawBody(snippet, body, opts);
      break;

    case 'formdata':
      snippet = addFormDataBody(snippet, body, opts);
      break;

    case 'file':
      snippet += opts.indent + form('-d', opts.format) +
        ` ${opts.quoteType}@${sanitize(body[body.mode].src, opts.trim, opts.quoteType)}${opts.quoteType}`;
      break;

    default:
      snippet += `${opts.indent}${form('-d', opts.format)} ${opts.quoteType}${opts.quoteType}`;
  }

  return snippet;
}

/**
 * Add authentication flags to snippet
 *
 * @param {string} snippet - Current snippet
 * @param {Object} request - The request object
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addAuthentication (snippet, request, opts) {
  if (request.auth) {
    snippet += getAuthFlags(request.auth, opts.quoteType, opts.indent);
  }
  return snippet;
}

/**
 * Add redirect options to snippet
 *
 * @param {string} snippet - Current snippet
 * @param {Object} opts - Extracted options
 * @returns {string} Updated snippet
 */
function addRedirectOptions (snippet, opts) {
  if (!opts.redirect) {
    snippet += `${opts.indent}--redirects-ignore`;
  }

  if (opts.followOriginalHttpMethod) {
    snippet += `${opts.indent}--redirects-follow-method`;
  }

  if (opts.maxRedirects > 0) {
    snippet += `${opts.indent}--redirects-max ${opts.maxRedirects}`;
  }

  return snippet;
}

self = module.exports = {
  convert: function (request, options, callback) {

    if (!_.isFunction(callback)) {
      throw new Error('Postman-CLI-Converter: callback is not valid function');
    }
    options = sanitizeOptions(options, self.getOptions());

    // Initialize options
    const opts = initializeOptions(options, request);

    // Build base command
    let snippet = buildBaseCommand(request, opts, options);

    // Add quiet and timeout flags
    snippet = addQuietAndTimeout(snippet, opts);

    // Set default Content-Type if needed
    setDefaultContentType(request);

    // Add headers
    snippet = addHeaders(snippet, request, opts);

    // Process formdata
    processFormData(request);

    // Add body data
    snippet = addBodyData(snippet, request, opts);

    // Add authentication
    snippet = addAuthentication(snippet, request, opts);

    // Add redirect options
    snippet = addRedirectOptions(snippet, opts);

    callback(null, snippet);
  },
  getOptions: function () {
    return [
      {
        name: 'Set indentation type',
        id: 'indentType',
        type: 'enum',
        availableOptions: ['Tab', 'Space'],
        default: 'Space',
        description: 'Select the character used to indent lines of code'
      },
      {
        name: 'Set indentation count',
        id: 'indentCount',
        type: 'positiveInteger',
        default: 2,
        description: 'Set the number of indentation characters to add per code level'
      },
      {
        name: 'Generate multiline snippet',
        id: 'multiLine',
        type: 'boolean',
        default: true,
        description: 'Split cURL command across multiple lines'
      },
      {
        name: 'Use long form options',
        id: 'longFormat',
        type: 'boolean',
        default: true,
        description: 'Use the long form for cURL options (--header instead of -H)'
      },
      {
        name: 'Line continuation character',
        id: 'lineContinuationCharacter',
        availableOptions: ['\\', '^', '`'],
        type: 'enum',
        default: '\\',
        description: 'Set a character used to mark the continuation of a statement on the next line ' +
          '(generally, \\ for OSX/Linux, ^ for Windows cmd and ` for Powershell)'
      },
      {
        name: 'Quote Type',
        id: 'quoteType',
        availableOptions: ['single', 'double'],
        type: 'enum',
        default: 'single',
        description: 'String denoting the quote type to use (single or double) for URL ' +
          '(Use double quotes when running curl in cmd.exe and single quotes for the rest)'
      },
      {
        name: 'Set request timeout (in seconds)',
        id: 'requestTimeoutInSeconds',
        type: 'positiveInteger',
        default: 0,
        description: 'Set number of seconds the request should wait for a response before ' +
          'timing out (use 0 for infinity)'
      },
      {
        name: 'Follow redirects',
        id: 'followRedirect',
        type: 'boolean',
        default: true,
        description: 'Automatically follow HTTP redirects'
      },
      {
        name: 'Follow original HTTP method',
        id: 'followOriginalHttpMethod',
        type: 'boolean',
        default: false,
        description: 'Redirect with the original HTTP method instead of the default behavior of redirecting with GET'
      },

      {
        name: 'Maximum number of redirects',
        id: 'maxRedirects',
        type: 'positiveInteger',
        default: 0,
        description: 'Set the maximum number of redirects to follow, defaults to 0 (unlimited)'
      },
      {
        name: 'Trim request body fields',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Remove white space and additional lines that may affect the server\'s response'
      },
      {
        name: 'Use Quiet Mode',
        id: 'quiet',
        type: 'boolean',
        default: false,
        description: 'Display the requested data without showing any extra output.'
      },
      {
        name: 'Use Debug Mode',
        id: 'debug',
        type: 'boolean',
        default: false,
        description: 'Show detailed execution information including retry attempts, redirects, and timing breakdowns.'
      }
    ];
  }
};
