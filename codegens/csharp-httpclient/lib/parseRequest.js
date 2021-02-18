
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
    if (!header.disabled && sanitize(header.key) !== 'Content-Type') {
      headerSnippet += `request.Headers.Add("${sanitize(header.key, true)}", "${sanitize(header.value)}");\n`;
    }
    return headerSnippet;
  }, '');
}

/**
 * Parses request object and returns csharp-httpclient code snippet for adding request body
 *
 * @param {Object} requestBody - JSON object representing body of request
 * @returns {String} code snippet of csharp-httpclient parsed from request object
 */
function parseFormData (requestBody) {
  if (!Array.isArray(requestBody[requestBody.mode])) {
    return '';
  }

  let mainContent = requestBody[requestBody.mode].reduce((body, data) => {
    if (data.disabled) {
      return body;
    }
    if (data.type === 'file') {
      body += `content.Add(new StreamContent(File.Create("${sanitize(data.src)}")), "${data.key}");\n`;
    }
    else {
      (!data.value) && (data.value = '');
      body += `content.Add(new StringContent("${sanitize(data.value)}"), "${sanitize(data.key)}");\n`;
    }

    return body;
  }, '');

  if (!mainContent) {
    return '';
  }

  return 'var content = new MultipartFormDataContent();\n' + mainContent;
}

function parseGraphQL (requestBody) {
  let query = requestBody.graphql.query,
    graphqlVariables;
  try {
    graphqlVariables = JSON.parse(requestBody.graphql.variables);
  }
  catch (e) {
    graphqlVariables = {};
  }
  return 'var content = new StringContent(' +
    `"${sanitize(JSON.stringify({query: query, variables: graphqlVariables}))}");\n`;
}

function parseBody (request) {
  var requestBody = request.body ? request.body.toJSON() : {};
  if (!_.isEmpty(requestBody)) {
    switch (requestBody.mode) {
      case 'urlencoded':
        return parseFormData(requestBody);
      case 'formdata':
        return parseFormData(requestBody);
      case 'raw':
        return `var content = new StringContent("${JSON.stringify(requestBody[requestBody.mode])}");\n`;
      case 'graphql':
        return parseGraphQL(requestBody);
      case 'file':
        return 'var content = new StreamContent(File.Create("<file path>"));\n';
      default:
        return '';
    }
  }
  return '';
}


function parseContentType (request) {
  return request.getHeaders({enabled: true, ignoreCase: true})['content-type'] || 'text/plain';
}

module.exports = {
  parseHeader: parseHeader,
  parseBody: parseBody,
  parseContentType: parseContentType
};
