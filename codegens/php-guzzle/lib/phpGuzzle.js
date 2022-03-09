const getOptions = require('./options').getOptions,
  sanitizeString = require('./util/sanitize').sanitizeString,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  parseBody = require('./util/parseBody').parseBody,
  guzzleTimeout = 'timeout',
  guzzleAllowRedirects = 'allow_redirects',
  _ = require('./lodash');

/**
 * Gets the defined indentation from options
 *
 * @param  {object} options - process options
 * @returns {String} - indentation characters
 */
function getIndentation (options) {
  if (options && options.indentType && options.indentCount) {
    let charIndentation = options.indentType === 'Tab' ? '\t' : ' ';
    return charIndentation.repeat(options.indentCount);
  }
  return '  ';
}

/**
 * Gets the defined body trim from options
 *
 * @param  {object} options - process options
 * @returns {boolea} - wheter to trim the request body
 */
function getBodyTrim (options) {
  if (options && options.trimRequestBody) {
    return options.trimRequestBody;
  }
  return false;
}

/**
 * Transforms an array of headers into the desired form of the language
 *
 * @param  {Array} mapToSnippetArray - array of key values
 * @param  {String} indentation - used for indenting snippet's structure
 * @param  {boolean} sanitize - whether to sanitize the key and values
 * @returns {String} - array in the form of [ key => value ]
 */
function getSnippetArray (mapToSnippetArray, indentation, sanitize) {
  let mappedArray = mapToSnippetArray.map((entry) => {
    return `${indentation}'${sanitize ? sanitizeString(entry.key, true) : entry.key}' => ` +
      `${sanitize ? '\'' + sanitizeString(entry.value) + '\'' : entry.value}`;
  });
  return `[\n${mappedArray.join(',\n')}\n]`;
}

/**
 * Transforms an array of headers into the desired form of the language
 *
 * @param  {Array} headers - postman SDK-headers
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getSnippetHeaders (headers, indentation) {
  if (headers.length > 0) {
    headers = headers.filter((header) => { return !header.disabled; });
    return `$headers = ${getSnippetArray(headers, indentation, true)};\n`;
  }
  return '';
}

/**
 * Used to get the headers and put them in the desired form of the language
 *
 * @param  {Object} request - postman SDK-request object
 * @returns {String} - request headers in the desired format
 */
function getRequestHeaders (request) {
  return request.headers.members;
}

/**
 * Returns the request's url in string format
 *
 * @param  {Object} request - postman SDK-request object
 * @returns {String} - request url in string representation
 */
function getRequestURL (request) {
  return request.url.toString();
}

/**
 * Returns the request's url in string format
 *
 * @param  {Object} request - postman SDK-request object
 * @returns {String} - request url in string representation
 */
function getRequestMethod (request) {
  return request.method;
}

/**
  * Validates if the input is a function
  *
  * @module convert
  *
  * @param  {*} validateFunction - postman SDK-request object
  * @returns {boolean} true if is a function otherwise false
  */
function validateIsFunction (validateFunction) {
  return typeof validateFunction === 'function';
}

/**
  * Returns the snippet header
  *
  * @module convert
  *
  * @returns {string} the snippet headers (uses)
  */
function getSnippetHeader () {
  return '<?php\n' +
    'use Psr\\Http\\Message\\ResponseInterface;\n' +
    'use GuzzleHttp\\Exception\\RequestException;\n' +
    'use GuzzleHttp\\Client;\n' +
    'use GuzzleHttp\\Psr7\\Request;\n';
}

/**
  * Returns the snippet footer sync
  *
  * @module convert
  * @returns {string} the snippet headers (uses)
  */
function getSnippetFooterSync () {
  return '$res = $client->send($request);\n' +
    'echo $res->getStatusCode();\n';
}

/**
  * Returns the snippet footer async
  *
  * @module convert
  * @returns {string} the snippet headers (uses)
  */
function getSnippetFooterAsync () {
  return '$promise = $client->sendAsync($request);\n' +
  '$promise->then(\n' +
  '  function (ResponseInterface $res) {\n' +
  '    echo $res->getStatusCode();\n' +
  '  },\n' +
  '  function (RequestException $e) {\n' +
  '    echo $e->getMessage();\n' +
  '    echo $e->getRequest()->getMethod();\n' +
  '  }\n' +
  ');\n';
}

/**
  * Returns the snippet footer
  *
  * @module convert
 * @param  {object} options - process options
  * @returns {string} the snippet headers (uses)
  */
function getSnippetFooter (options) {
  if (options && options.asyncType && options.asyncType === 'sync') {
    return getSnippetFooterSync();
  }
  return getSnippetFooterAsync();
}

/**
  * Generates the snippet for creating the request object
  * if has body is true then the body will be added
  *
  * @module convert
  *
  * @param  {string} method - request's method in string representation
  * @param  {string} url - request's url in string representation
  * @param  {boolean} hasBody - wheter the request has body or not
  * @returns {String} - returns generated PHP-Guzzle snippet for request creation
  */
function getSnippetRequestObject (method, url, hasBody) {
  if (hasBody) {
    return `$request = new Request('${method}', '${url}', $headers, $body);\n`;
  }
  return `$request = new Request('${method}', '${url}', $headers);\n`;
}

/**
 * Generates the snippet for the client's creation
 *
 * @param  {object} options - process options
 * @returns {String} - the snippet to create the client
 */
function getSnippetClient (options) {
  if (options) {
    let connectionTimeout = options.requestTimeout,
      followRedirect = options.followRedirect,
      clientOptions = [];
    if (connectionTimeout && connectionTimeout !== 0) {
      clientOptions.push({ key: guzzleTimeout, value: connectionTimeout });
    }
    if (followRedirect === false) {
      clientOptions.push({ key: guzzleAllowRedirects, value: followRedirect });
    }
    if (clientOptions.length > 0) {
      let snippetArrayOptions = getSnippetArray(clientOptions, getIndentation(options), false) + '\n';
      return `$client = new Client(${snippetArrayOptions});\n`;
    }
  }
  return '$client = new Client();\n';
}

/**
  * Used to convert the postman sdk-request object in PHP-Guzzle request snippet
  *
  * @module convert
  *
  * @param  {Object} request - postman SDK-request object
 * @param  {object} options - process options
  * @param  {Function} callback - function with parameters (error, snippet)
  * @returns {String} - returns generated PHP-Guzzle snippet via callback
  */
function convert (request, options, callback) {

  if (!validateIsFunction(callback)) {
    throw new Error('Php-Guzzle~convert: Callback is not a function');
  }
  let snippet = '';
  options = sanitizeOptions(options, getOptions());
  const method = getRequestMethod(request),
    indentation = getIndentation(options),
    url = getRequestURL(request),
    hasBody = !_.isEmpty(request.body),
    snippetHeaders = getSnippetHeaders(getRequestHeaders(request), indentation),
    snippetHeader = getSnippetHeader(),
    snippetClient = getSnippetClient(options),
    requestBuilderSnippet = getSnippetRequestObject(method, url, hasBody);
  snippet += snippetHeader;
  snippet += snippetClient;
  snippet += snippetHeaders;
  snippet += parseBody(request.body, indentation, getBodyTrim(options), request.headers.get('Content-Type'));
  snippet += requestBuilderSnippet;
  snippet += getSnippetFooter(options);

  return callback(null, snippet);
}

module.exports = {
  /**
   * Used in order to get options for generation of PHP-Guzzle code snippet
   *
   * @module getOptions
   *
   * @returns {Array} Options specific to generation of PHP-Guzzlep code snippet
   */
  getOptions,

  convert,
  getHeaders: getRequestHeaders,
  getSnippetHeaders,
  getURL: getRequestURL,
  getMethod: getRequestMethod,
  getIndentation,
  getSnippetClient,
  getSnippetFooter
};
