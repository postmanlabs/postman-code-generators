const getOptions = require('./options').getOptions,
  sanitizeString = require('./util/sanitize').sanitizeString,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  parseBody = require('./util/parseBody').parseBody;

/**
  * Returns the snippet header
  *
  * @module convert
  *
  * @returns {string} the snippet headers (uses)
  */
function getSnippetHeader () {
  return 'library(RCurl)\n';
}

/**
  * Returns the snippet footer
  *
  * @module convert
  * @returns {string} the snippet headers (uses)
  */
function getSnippetFooter () {
  return 'print(res)';
}

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
 * Returns the request's url in string format
 *
 * @param  {Object} request - postman SDK-request object
 * @returns {String} - request url in string representation
 */
function getRequestMethod (request) {
  return request.method;
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
  // mapToSnippetArray = groupHeadersSameKey(mapToSnippetArray);
  let mappedArray = mapToSnippetArray.map((entry) => {
    return `${indentation}"${sanitize ? sanitizeString(entry.key, true) : entry.key}" = ` +
    `${sanitize ? '"' + sanitizeString(entry.value) + '"' : entry.value}`;
  });
  return `c(\n${mappedArray.join(',\n')}\n)`;
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
    return `headers = ${getSnippetArray(headers, indentation, true)}\n`;
  }
  return '';
}

/**
  * Creates the snippet request for the postForm method
  *
  * @module convert
  *
  * @param  {string} url - string url of the service
  * @param  {string} style - "post":urlencoded params "httpost":multipart/form-data
  * @param  {boolean} hasParams - wheter or not include the params
  * @param  {boolean} hasHeaders - wheter or not include the headers
  * @returns {String} - returns generated snippet
  */
function getSnippetPostFormInParams (url, style, hasParams, hasHeaders) {
  let paramsSnippet = hasParams ? '.params = params,' : '',
    headersSnippet = hasHeaders ? ' .opts=list(httpheader=headers),' : '';

  return `res <- postForm("${url}",` +
    ` ${paramsSnippet}${headersSnippet} style = "${style}")\n`;
}

/**
  * Creates the snippet request for the getUrl method
  *
  * @module convert
  *
  * @param  {string} url - string url of the service
  * @param  {string} hasHeaders - wheter or not include the headers
  * @returns {String} - returns generated snippet
  */
function getSnippetGetURL (url, hasHeaders) {
  let headersSnippet = hasHeaders ? ', httpheader = headers' : '';
  return `res <- getURL("${url}"${headersSnippet})\n`;
}

/**
  * Creates the snippet request for the postForm method
  *
  * @module convert
  *
  * @param  {string} url - string url of the service
  * @param  {string} style - "post":urlencoded params "httpost":multipart/form-data
  * @param  {boolean} hasParams - wheter or not include the params
  * @param  {boolean} hasHeaders - wheter or not include the headers
  * @returns {String} - returns generated snippet
  */
function getSnippetPostFormInOptions (url, style, hasParams, hasHeaders) {

  if (hasHeaders && hasParams) {
    return `res <- postForm("${url}", .opts=list(httpheader=headers, postfields=params), style = "${style}")\n`;
  }
  if (hasHeaders && !hasParams) {
    return `res <- postForm("${url}", .opts=list(httpheader=headers), style = "${style}")\n`;
  }
  if (!hasHeaders && hasParams) {
    return `res <- postForm("${url}", .opts=list(postfields=params), style = "${style}")\n`;
  }
  if (!hasHeaders && !hasParams) {
    return `res <- postForm("${url}", style = "${style}")\n`;
  }
  return `res <- postForm("${url}", style = "${style}")\n`;
}

/**

/**
  * Creates the snippet request for either get ulr or post form
  *
  * @module convert
  *
  * @param  {string} url - string url of the service
  * @param  {string} method - request http method
  * @param  {string} style - "post":urlencoded params "httpost":multipart/form-data
  * @param  {boolean} hasParams - wheter or not include the params
  * @param  {boolean} hasHeaders - wheter or not include the headers
  * @param  {string} contentTypeHeaderValue - the content type header value
  * @returns {String} - returns generated snippet
  */
function getSnippetRequest (url, method, style, hasParams, hasHeaders, contentTypeHeaderValue) {
  const methodUC = method.toUpperCase();
  if (methodUC === 'GET') {
    return getSnippetGetURL(url, hasHeaders);
  }
  if (methodUC === 'POST' && contentTypeHeaderValue === 'application/x-www-form-urlencoded' ||
    contentTypeHeaderValue === 'multipart/form-data') {
    return getSnippetPostFormInParams(url, style, hasParams, hasHeaders);
  }
  if (methodUC === 'POST') {
    return getSnippetPostFormInOptions(url, 'post', hasParams, hasHeaders);
  }
  return '';
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
 * Gets the http post style
 *
 *"post":urlencoded params "httpost":multipart/form-data

 * @param  {string} method - request http method
 * @param  {string} contentType - request content type
 * @returns {string} - the post form style
 */
function getCurlStyle (method, contentType) {
  if (method.toUpperCase() === 'POST') {
    if (contentType === 'application/x-www-form-urlencoded') {
      return 'post';
    }
    return 'httppost';
  }
  return '';
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
    throw new Error('R-Rcurl~convert: Callback is not a function');
  }
  let snippet = '';
  options = sanitizeOptions(options, getOptions());

  const method = getRequestMethod(request),
    indentation = getIndentation(options),
    contentTypeHeaderValue = request.headers.get('Content-Type'),
    url = getRequestURL(request),
    snippetHeaders = getSnippetHeaders(getRequestHeaders(request), indentation),
    snippetHeader = getSnippetHeader(),
    snippetFooter = getSnippetFooter(),
    snippetbody = parseBody(request.body, indentation, getBodyTrim(options), contentTypeHeaderValue),
    snippetRequest = getSnippetRequest(url, method, getCurlStyle(method, contentTypeHeaderValue),
      snippetbody !== '', snippetHeaders !== '', contentTypeHeaderValue);

  snippet += snippetHeader;
  snippet += snippetHeaders;
  snippet += snippetbody;
  snippet += snippetRequest;
  snippet += snippetFooter;

  return callback(null, snippet);
}

module.exports = {
  /**
   * Used in order to get options for generation of R-rCurl code snippet
   *
   * @module getOptions
   *
   * @returns {Array} Options specific to generation of R-rCurl code snippet
   */
  getOptions,

  convert,
  getSnippetHeaders,
  getSnippetPostFormInParams,
  getSnippetGetURL,
  getSnippetRequest,
  getSnippetPostFormInOptions
};
