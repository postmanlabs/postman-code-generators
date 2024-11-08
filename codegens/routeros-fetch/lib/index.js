
const
  utils = require('./utils'),
  { Url } = require('postman-collection/lib/collection/url');

/**
 * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
 *
 * @module getOptions
 *
 * @returns {Array} Additional options specific to generation of http code snippet
 */
function getOptions () {
  return [
    {
      name: 'Snippet output type',
      id: 'style',
      availableOptions: [
        'plain',
        'outputToConsole',
        'outputToVariable',
        'outputToVariableWithHeaders',
        'outputToFile'],
      type: 'enum',
      default: 'outputToConsole',
      description:
      'Control the flavor ("style") of generated snippets'
    },
    {
      name: 'Additional commentary',
      id: 'commentary',
      availableOptions: ['none', 'errors', 'all'],
      type: 'enum',
      default: 'all',
      description:
      'Enables output of errors and tips'
    }
  ];
}

/**
 * Converts a Postman SDK request to HTTP message
 *
 * @param {Object} request - Postman SDK request
 * @param {Object} options - Options for converter
 * @param {Function} callback callback
 * @returns {Function} returns the snippet with the callback function.
 */
function convert (request, options, callback) {
  let attrs = new Map(),
    cmd = [],
    errors = [],
    snippet = '';

  // handle options
  options = utils.sanitizeOptions(options, getOptions());
  if (options.commentary === 'errors') { options.logLevel = 1; }
  else if (options.commentary === 'none') { options.logLevel = 0; }
  else if (options.commentary === 'all') { options.logLevel = 2; }
  else { options.logLevel = 2; }

  // http-method= delete|get|head|post|put|patch
  if (['DELETE', 'GET', 'HEAD', 'POST', 'PUT', 'PATCH'].some((method) => { return method === request.method; })) {
    attrs.set('http-method', request.method.toLowerCase());
  }
  else {
    errors.push(`* invalid http method ${request.method} used`);
  }


  // authentication
  if (request.url.auth) {
    // user=
    if (request.url.auth.user) {
      attrs.set('user', utils.escapeRouterOSString(request.url.auth.user));
    }
    // password=
    if (request.url.auth.password) {
      attrs.set('password', utils.escapeRouterOSString(request.url.auth.password));
    }
  }

  // http-auth-scheme=
  if (request.auth && request.auth.type) {
    switch (request.auth.type) {
      case 'basic': {
        attrs.set('http-auth-scheme', request.auth.type);
        if (request.auth.has('username')) {
          attrs.set('user', utils.escapeRouterOSString(request.auth.get('username')));
        }
        if (request.auth.has('password')) {
          attrs.set('password', utils.escapeRouterOSString(request.auth.get('password')));
        }
        break;
      }
      case 'digest': {
        attrs.set('http-auth-scheme', request.auth.type);
        if (request.auth.digest.has('username')) {
          attrs.set('user', utils.escapeRouterOSString(request.auth.digest.get('username')));
        }
        if (request.auth.digest.has('password')) {
          attrs.set('password', utils.escapeRouterOSString(request.auth.digest.get('password')));
        }
        break;
      }
      default:
        errors.push(`* unsupported authentication method used: ${request.auth.type}`);
        break;
    }
  }


  // url=
  // var urlnoauth = Url.parse(request.url.toString(true));
  request.url.auth = null;
  if (request.url.getHost().startsWith('http')) {
    const invalidHost = new Url(request.url.getHost());
    request.url.host = invalidHost.getHost();
    request.url.protocol = invalidHost.protocol;
  }
  attrs.set('url', utils.escapeRouterOSString(request.url.toString(true)));


  // http-data=
  if (['POST', 'PUT'].some((method) => { return method === request.method; })) {
    attrs.set('http-data', utils.escapeRouterOSString(utils.getBody(request, false)));
    // http-content-encoding=
    if (request.headers.has('Content-Encoding')) {
      const contentEncoding = request.headers.get('Content-Encoding');
      if (contentEncoding.startsWith('gzip')) { attrs.set('http-content-encoding', 'gzip'); }
      else if (contentEncoding.startsWith('deflate')) { attrs.set('http-content-encoding', 'deflate'); }
    }
  }

  // http-header-field=
  let headers = utils.getHeadersArray(request);
  headers = headers.map((header) => {
    if (header.includes('%') || header.includes(',')) {
      errors.push(`* Special characters in headers have many interpretations, check escaping - ${header} `);
    }
    return utils.escapeRouterOSString(header);
  });
  if (headers.length === 1) {
    if (headers[0].includes(',')) {
      headers[0] = headers[0].replace(/[,]/g, '\\\\,');
    }
    attrs.set('http-header-field', headers[0]);
  }
  else if (headers.length > 1) {
    attrs.set('http-header-field', `(${headers.join(',')})`);
  }

  // build the actual raw /tool/fetch command
  cmd.push('/tool/fetch');
  attrs.forEach((val, key) => {
    const attr = key + '=' + val;
    if (attr.length > 4096) {
      errors.push(`* '${key}=' may be too long for RouterOS`);
    }
    cmd.push(attr);
  });

  // map 'options.style' to command forms
  let styles = {
    plain: cmd.join(' '),
    outputToConsole: `:put ([${cmd.join(' ')} as-value output=user]->"data")`,
    outputToVariable: `:global resp [${cmd.join(' ')} as-value output=user]`,
    outputToVariableWithHeaders: `:global resp [${cmd.join(' ')} as-value output=user-with-headers ]`,
    outputToFile: `${cmd.join(' ')} output=file`
  };

  // output errors as comments
  if (errors.length > 0 && options.logLevel > 0) {
    snippet += '#\t\t*** PROBLEMS ***\r\n';
    snippet += '#  Warning: Some conversion errors were found:\r\n';
    errors.forEach((err) => {
      snippet += `#    ${err}\r\n`;
    });
    snippet += '\r\n';
  }

  // if request appears JSON, include tip to use [:deserialize]
  if (request.headers.has('Content-Type') &&
      request.headers.get('Content-Type') === 'application/json' &&
      options.logLevel > 1) {
    snippet += '#\t\t*** TIPS: Parsing JSON ***\r\n';
    snippet += '#  Your request may return a JSON response.\r\n';
    snippet += '#  RouterOS has support to parse the JSON string data returned into RouterOS array.\r\n';
    snippet += '#  For example,\r\n';
    snippet += `#\t${styles.outputToVariable}\r\n`;
    snippet += '#\t:global json [:deserialize ($resp->"data") from=json]\r\n';
    snippet += '#\t:put $json\r\n';
    snippet += '\r\n';
  }

  // finally, out the command based on the style
  snippet += styles[options.style];

  // done.  errors are not fatal, so 'null', but added as comments in snippet instead
  return callback(null, snippet);
}

module.exports = {
  getOptions: getOptions,
  convert: convert
};
