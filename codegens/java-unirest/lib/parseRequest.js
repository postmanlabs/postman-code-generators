var _ = require('./lodash'),

  sanitize = require('./util').sanitize;

/**
 * parses form data from request body and returns codesnippet in java unirest
 *
 * @param {Object} requestbody - JSON object acquired by request.body.JSON()
 * @param {String} indentString - value for indentation
 * @param {Boolean} trimField - whether to trim fields of the request body
 * @returns {String} - body string parsed from JSON object
 */
function parseFormData (requestbody, indentString, trimField) {
  return _.reduce(requestbody[requestbody.mode], function (body, data) {
    if (data.disabled) {
      return body;
    }
    if (data.type === 'file') {
      body += indentString + `.field("file", new File("${sanitize(data.src, trimField)}"))\n`;
    }
    else {
      (!data.value) && (data.value = '');
      body += indentString + `.field("${sanitize(data.key, trimField)}", ` +
                                    `"${sanitize(data.value, trimField)}")\n`;
    }
    return body;
  }, '');
}

/**
 * parses body from request object based on mode provided by request body and
 * returns codesnippet in java unirest
 *
 * @param {Object} request - postman request object, more information can be found in postman collection sdk
 * @param {String} indentString - value for indentation
 * @param {Boolean} trimField - whether to trim fields of body of the request
 * @returns {String} - body string parsed from request object
 */
function parseBody (request, indentString, trimField) {
  if (request.body) {
    switch (request.body.mode) {
      case 'urlencoded':
        return parseFormData(request.body.toJSON(), indentString, trimField);
      case 'raw':
        return indentString + `.body(${JSON.stringify(request.body.toString())})\n`;
      case 'formdata':
        return parseFormData(request.body.toJSON(), indentString, trimField);
      case 'file':
        return indentString + '.body("<file contents here>")\n';
      default:
        return '';
    }
  }
  return '';
}

/**
 * parses header from request and returns codesnippet in java unirest
 *
 * @param {Object} request - postman request object, more information can be found in postman collection sdk
 * @param {String} indentString - value for indentation
 * @returns {String} - body string parsed from request object
 */
function parseHeader (request, indentString) {
  var headerObject = request.getHeaders({enabled: true}),
    headerSnippet = '';
  if (!_.isEmpty(headerObject)) {
    headerSnippet += Object.keys(headerObject).reduce(function (accumlator, key) {
      accumlator += indentString + `.header("${sanitize(key)}", "${sanitize(headerObject[key])}")\n`;
      return accumlator;
    }, '');
  }
  return headerSnippet;
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader
};
