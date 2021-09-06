
var _ = require('./lodash'),
  sanitize = require('./util').sanitize;

function parseContentType (request) {
  return request.getHeaders({enabled: true, ignoreCase: true})['content-type'] || 'text/plain';
}

/**
 * Parses header in Postman-SDK request and returns code snippet of csharp-httpclient for adding headers
 *
 * @param {Object} builder - Code Builder
 * @param {Object} requestJson - Postman SDK request object
 */
function parseHeader (builder, requestJson) {
  // Possibly add support for the typed header properties
  if (!Array.isArray(requestJson.header)) {
    return;
  }

  return requestJson.header.forEach((header) => {
    if (!header.disabled && sanitize(header.key) !== 'Content-Type') {
      builder.appendLine(`request.Headers.Add("${sanitize(header.key, true)}", "${sanitize(header.value)}");`);
    }
  });
}

/**
 *
 * @param {CodeBuilder} builder
 * @param {Object} requestBody
 * @param {String} contentName
 */
function parseFormUrlEncoded (builder, requestBody, contentName) {
  if (!contentName) {
    contentName = 'content';
  }

  if (!Array.isArray(requestBody[requestBody.mode])) {
    return;
  }


  let list = requestBody[requestBody.mode].reduce((collection, data) => {
    if (data.disabled || data.type === 'file') {
      return collection;
    }

    (!data.value) && (data.value = '');
    collection.push('collection.Add(new' +
      `("${sanitize(data.key)}", "${sanitize(data.value)}"));`);

    return collection;
  }, []);

  if (list) {
    builder.appendLine('var collection = new List<KeyValuePair<string, string>>();');
    builder.appendLines(list);
    builder.appendLine('var content = new FormUrlEncodedContent(collection);');
  }
}

/**
 *
 * @param {CodeBuilder} builder
 * @param {Object} requestBody
 */
function parseFormData (builder, requestBody) {
  if (!Array.isArray(requestBody[requestBody.mode])) {
    return;
  }

  // Determine mode
  var hasFile = requestBody[requestBody.mode].some((i) => {
      return i.type === 'file';
    }),
    hasText = requestBody[requestBody.mode].some((i) => {
      return i.type === 'text';
    }),
    formContent = '';

  if (hasFile && hasText) {
    // Mixed mode, I will find both form and file items in here
    parseFormUrlEncoded(builder, requestBody, 'formContent');

    return 'var content = new MultipartFormDataContent();\n' +
      formContent +
      'content.Add(formContent);\n';
  }
  else if (hasFile) {
    // This is file only mode
    builder.appendLine('var content = new MultipartFormDataContent();\n' +
      requestBody[requestBody.mode].reduce((body, data) => {
        if (Array.isArray(data.src)) {
          // Many files
          body += data.src.reduce((filesBody, fileSrc) => {
            filesBody += 'content.Add(new StreamContent(new MemoryStream(' +
              `File.ReadAllBytes("${sanitize(fileSrc)}"))), "${sanitize(data.key)}", ` +
              `Path.GetFileName("${sanitize(fileSrc)}"));\n`;
            return filesBody;
          }, '');
        }
        else {
          // Single files
          body += 'content.Add(new StreamContent(new MemoryStream(' +
            `File.ReadAllBytes("${sanitize(data.src)}"))), "${sanitize(data.key)}", ` +
            `Path.GetFileName("${sanitize(data.src)}"));\n`;
        }
        return body;
      }, ''));
  }
  // This is a form only
  parseFormUrlEncoded(builder, requestBody);
}

/**
 *
 * @param {CodeBuilder} builder
 * @param {Object} requestBody
 */
function parseGraphQL (builder, requestBody) {
  let query = requestBody.graphql.query,
    graphqlVariables;
  try {
    graphqlVariables = JSON.parse(requestBody.graphql.variables);
  }
  catch (e) {
    graphqlVariables = {};
  }
  builder.appendLine('var content = new StringContent(' +
    `"${sanitize(JSON.stringify({query: query, variables: graphqlVariables}))}"` +
    ', null, "application/json");');
}

/**
 *
 * @param {CodeBuilder} builder
 * @param {Object} request
 */
function parseBody (builder, request) {
  var requestBody = request.body ? request.body.toJSON() : {};
  if (!_.isEmpty(requestBody)) {
    switch (requestBody.mode) {
      case 'urlencoded':
        parseFormUrlEncoded(builder, requestBody);
        builder.appendLine(
          `content.Headers.ContentType = new MediaTypeHeaderValue("${parseContentType(request)}");`);
        builder.addUsing('System.Net.Http.Headers');
        builder.appendLine('request.Content = content;');
        break;
      case 'formdata':
        parseFormData(builder, requestBody);
        break;
      case 'raw':
        builder.appendLine(
          `var content = new StringContent(${JSON.stringify(requestBody[requestBody.mode])});`);
        builder.appendLine(
          `content.Headers.ContentType = new MediaTypeHeaderValue("${parseContentType(request)}");`);
        builder.addUsing('System.Net.Http.Headers');
        break;
      case 'graphql':
        parseGraphQL(builder, requestBody);
        break;
      case 'file':
        builder
          .appendLine('var content = new StreamContent(File.Create("<file path>"));');
        break;
      default:
    }
  }
}

module.exports = {
  parseHeader: parseHeader,
  parseBody: parseBody,
  parseContentType: parseContentType
};
