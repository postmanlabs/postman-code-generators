
var _ = require('./lodash'),
  sanitize = require('./util').sanitize;

/**
 * Parses header in Postman-SDK request and returns code snippet of csharp-httpclient for adding headers
 *
 * @param {Object} requestJson - Postman SDK request object
 * @returns {String} code snippet for adding headers in csharp-httpclient
 */
function parseHeader (requestJson) {
  // Possibly add support for the typed header properties
  if (!Array.isArray(requestJson.header)) {
    return '';
  }

  return requestJson.header.reduce((headerSnippet, header) => {
    if (!header.disabled) {
      headerSnippet += `request.Headers.Add("${sanitize(header.key, true)}", "${sanitize(header.value)}");\n`;
    }
    return headerSnippet;
  }, '');
}

/**
 * Parses request object and returns csharp-httpclient code snippet for adding request body
 *
 * @param {Object} request - JSON object representing body of request
 * @returns {String} code snippet of csharp-httpclient parsed from request object
 */

function parseFormData (requestBody) {
  if (!Array.isArray(requestBody[requestBody.mode])) {
    return '';
  }

  return requestBody[requestBody.mode].reduce((body, data) => {
    if (data.disabled) {
      return body;
    }
    if (data.type === 'file') {
      body += `// File Key: ${sanitize(data.key)} Source: ${sanitize(data.src)}`;
    }
    else {
      (!data.value) && (data.value = '');
      body += `// Parameter Key: ${sanitize(data.key)} Value: ${sanitize(data.value)}`;
    }

    return body;
  }, '');
}

function parseBody (request) {
  var requestBody = request.body ? request.body.toJSON() : {};
  if (!_.isEmpty(requestBody)) {
    switch (requestBody.mode) {
      case 'urlencoded':
        return parseFormData(request);
      case 'formdata':
        return parseFormData(request);
      case 'raw':
        return '// raw\n';
      case 'graphql':
        return '// graphql\n';
      case 'file':
        return '// file\n';
      default:
        return '// default\n';
    }
  }
  return '// empty\n';
}

module.exports = {
  parseHeader: parseHeader,
  parseBody: parseBody
};
