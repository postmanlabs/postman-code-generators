var _ = require('./lodash'),
  sanitize = require('./util').sanitize;

function parseContentType (contentType) {
  return contentType || 'text/plain';
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
 */
function parseFormUrlEncoded (builder, requestBody) {
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
    builder.addUsing('System.Collections.Generic');
  }
}

/**
 *
 * @param {CodeBuilder} builder
 * @param {String} key
 * @param {String} fileSrc
 */
function addFile (builder, key, fileSrc) {
  builder.appendLine('content.Add(new StreamContent(File.OpenRead' +
    `("${sanitize(fileSrc)}")), "${sanitize(key)}", "${sanitize(fileSrc)}");`);
  builder.addUsing('System.IO');
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

  var anyEnabled = requestBody[requestBody.mode].some((i) => {
    return !i.disabled;
  });

  if (!anyEnabled) {
    return;
  }

  builder.appendLine('var content = new MultipartFormDataContent();');

  requestBody[requestBody.mode].forEach((i) => {
    if (i.disabled) {
      return;
    }

    if (i.type === 'text') {
      builder.appendLine('content.Add(new StringContent(' +
        `"${sanitize(i.value)}"), "${sanitize(i.key)}");`);
    }
    else if (i.type === 'file') {
      if (Array.isArray(i.src)) {
        // Multiple files
        i.src.forEach((file) => {
          addFile(builder, i.key, file);
        });
      }
      else {
        // Single file
        addFile(builder, i.key, i.src);
      }
    }
  });


  builder.appendLine('request.Content = content;');
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
    `"${sanitize(JSON.stringify({ query: query, variables: graphqlVariables }))}"` +
    ', null, "application/json");');
}

/**
 *
 * @param {CodeBuilder} builder
 * @param {Object} request
 */
function parseBody (builder, request) {
  var requestBody = request.body ? request.body.toJSON() : {},
    contentType = request.getHeaders({ enabled: true, ignoreCase: true })['content-type'];
  if (!_.isEmpty(requestBody)) {
    switch (requestBody.mode) {
      case 'urlencoded':
        parseFormUrlEncoded(builder, requestBody);
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
          `content.Headers.ContentType = new MediaTypeHeaderValue("${parseContentType(contentType)}");`);
        builder.addUsing('System.Net.Http.Headers');
        builder.appendLine('request.Content = content;');
        break;
      case 'graphql':
        parseGraphQL(builder, requestBody);
        builder.appendLine(
          'content.Headers.ContentType = new MediaTypeHeaderValue("application/json");');
        builder.addUsing('System.Net.Http.Headers');
        builder.appendLine('request.Content = content;');
        break;
      case 'file':
        builder
          .appendLine('var content = new StreamContent(File.Create("<file path>"));');
        break;
      default:
    }
  }
  else if (contentType) {
    // The request has no body but sometimes it wants me to force a content-type anyways
    builder.appendLine('var content = new StringContent(string.Empty);');
    builder.appendLine('content.Headers.ContentType = new MediaTypeHeaderValue("' +
      `${contentType}");`);
    builder.addUsing('System.Net.Http.Headers');
    builder.appendLine('request.Content = content;');
  }
}

module.exports = {
  parseHeader: parseHeader,
  parseBody: parseBody
};
