
var _ = require('./lodash'),
  sanitize = require('./util').sanitize;

/**
 * Parses body of request specific requests having form data
 *
 * @param {Object} requestBody - JSON object representing body of request
 * @param {Boolean} trimFields - indicates whether to trim fields of body
 * @param {String} bodyMode - indicates the request body mode
 * @returns {String} code snippet of csharp-dotnetcore for multipart formdata
 */
function parseFormData (requestBody, trimFields, bodyMode) {
  if (!Array.isArray(requestBody[requestBody.mode])) {
    return '';
  }

  return requestBody[requestBody.mode].reduce((body, data) => {
    if (data.disabled) {
      return body;
    }
    if (data.type === 'file') {
      body += `requestContent.Add(new StreamContent(File.OpenRead("${sanitize(data.src, trimFields)}")), "${sanitize(data.key, trimFields)}", "${sanitize(data.src, trimFields)}");\n`;
    }
    else {
      (!data.value) && (data.value = '');
      switch (bodyMode) {
        case 'urlencoded':
          body += `formData.Add(new KeyValuePair<string, string>("${sanitize(data.key, trimFields)}", "${sanitize(data.value, trimFields)}"));\n`;
          break;
        case 'formdata':
          body += `requestContent.Add(new StringContent("${sanitize(data.value, trimFields)}"), "${sanitize(data.key, trimFields)}");\n`;
          break;
        default: // Should not get here
          break;
      }
      
    }

    return body;
  }, '');
}

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
  var requestBody = request.body.toJSON();
  var bodyMode = requestBody.mode;
  if (!_.isEmpty(requestBody)) {
    switch (requestBody.mode) {
      case 'urlencoded':
        return 'IList<KeyValuePair<string, string>> formData = new List<KeyValuePair<string, string>>();\n' +
               `${parseFormData(requestBody, trimFields, bodyMode)}` +
               'FormUrlEncodedContent requestContent = new FormUrlEncodedContent(formData);\n' +
               'request.Content = requestContent;\n';
      case 'formdata':
        return 'MultipartFormDataContent requestContent = new MultipartFormDataContent();\n' +
               `${parseFormData(requestBody, trimFields, bodyMode)}` +
               'request.Content = requestContent;\n';
      case 'raw':
        return `request.Content = new StringContent(${JSON.stringify(requestBody[requestBody.mode])}, Encoding.UTF8, "${parseContentType(request)}");\n`;
        /* istanbul ignore next */
      case 'file':
        return `${JSON.stringify(requestBody[requestBody.mode].src, trimFields)}`;
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
      // Content type headers are added directly to the object that sends the request.
      if (sanitize(header.key) === 'Content-Type') {

      }
      else {
        headerSnippet += `request.Headers.Add("${sanitize(header.key)}", "${sanitize(header.value)}");\n`;
      }
    }
    return headerSnippet;
  }, '');
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader,
  parseContentType: parseContentType
};
