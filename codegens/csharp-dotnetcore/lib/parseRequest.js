
var _ = require('./lodash'),
  sanitize = require('./util').sanitize;

/**
 * Parses body of request specific requests having form data
 *
 * @param {Object} requestBody - JSON object representing body of request
 * @param {Boolean} trimFields - indicates whether to trim fields of body
 * @returns {String} code snippet of csharp-dotnetcore for multipart formdata
 */
function parseFormData (requestBody, trimFields) {
  if (!Array.isArray(requestBody[requestBody.mode])) {
    return '';
  }

  var newBody = requestBody[requestBody.mode].reduce((body, data) => {
    if (data.disabled) {
      return body;
    }
    if (data.type === 'file') {
      body += `\\"key\\": \\"${sanitize(data.key, trimFields)}\\",\\n\\"value\\": \\"${sanitize(data.src, trimFields)}\\",\\n`;
    }
    else {
      (!data.value) && (data.value = '');
      body += `\\"key\\": \\"${sanitize(data.key, trimFields)}\\",\\n\\"value\\": \\"${sanitize(data.value, trimFields)}\\",\\n`;
    }

    return body;
  }, '');

  newBody = newBody.substring(0, newBody.length - 3); // Trim the last comma and newline escape character off.
  return newBody;
}

/**
 * 
 * 
 * @param {String} requestUrl 
 * @param {Boolean} trimFields 
 */
/* function addParameter(requestUrl, trimFields) {
  if (requestUrl.contains('?')) {
    requestUrl += `?${sanitize(data.key, trimFields)}=` +
    `${sanitize(data.value, trimFields)}`;
  }
  else {
    requestUrl += `&${sanitize(data.key, trimFields)}=` +
    `${sanitize(data.value, trimFields)}`;
  }
  
  return requestUrl;
} */

/**
 * Returns content-type of request body if available else returns text/plain as default
 *
 * @param {Object} request - Postman SDK request object
 * @returns {String} content-type of request body
 */
function parseContentType (request) {
  return request.getHeaders({enabled: true, ignoreCase: true})['content-type'] || 'text/plain';
}


/**
 * Parses request object and returns csharp-dotnetcore code snippet for adding request body
 *
 * @param {Object} request - JSON object representing body of request
 * @param {Boolean} trimFields - indicates whether to trim fields of body
 * @returns {String} code snippet of csharp-dotnetcore parsed from request object
 */
function parseBody (request, trimFields) {
  var requestBody = request.body.toJSON(),
    requestUrl = request.url.toString();
  if (!_.isEmpty(requestBody)) {
    switch (requestBody.mode) {
      case 'urlencoded':
        return parseFormData(requestBody, requestUrl, trimFields);
      case 'formdata':
        return parseFormData(requestBody, requestUrl, trimFields);
      case 'raw':
        return `${JSON.stringify(requestBody[requestBody.mode])}\\n`;
        /* istanbul ignore next */
      case 'file':
        return `${JSON.stringify(requestBody[requestBody.mode].src, trimFields)}"\\n`;
      default:
        return '';
    }
  }
  return '';
}

/**
 * Parses header in Postman-SDK request and returns code snippet of csharp-dotnetcore for adding headers
 *
 * @param {Object} requestJson - Postman SDK reqeust object
 * @returns {String} code snippet for adding headers in csharp-dotnetcore
 */
function parseHeader (requestJson) {
  if (!Array.isArray(requestJson.header)) {
    return '';
  }

  return requestJson.header.reduce((headerSnippet, header) => {
    if (!header.disabled) {
      headerSnippet += `\t\t\tclient.DefaultRequestHeaders.Add("${sanitize(header.key)}", "${sanitize(header.value)}");\n`;
    }
    return headerSnippet;
  }, '');
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader,
  parseContentType: parseContentType
};
