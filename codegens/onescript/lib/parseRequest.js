var _ = require('./lodash'),
  sanitize = require('./util').sanitize;

/**
 * Parses Formdata from request to axios syntax
 *
 * @param {Object} body FormData body
 * @param {boolean} trim trim body option
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseFormData (body, trim, ES6_enabled) {
  var varDeclare = ES6_enabled ? 'const' : 'var',
    bodySnippet = varDeclare + ' FormData = require(\'form-data\');\n';
  // check if there's file
  
  return bodySnippet;
}

/**
 * Parses Raw data to axios syntax
 *
 * @param {Object} body Raw body data
 * @param {boolean} trim trim body option
 * @param {String} contentType Content type of the body being sent
 * @param {boolean} ES6_enabled ES6 syntax option
 * @param {String} indentString Indentation string
 */
function parseRawBody (body, trim, contentType, ES6_enabled, indentString) {
  var varDeclare = ES6_enabled ? 'let' : 'var',
    bodySnippet = varDeclare + ' data = ';
  
  return bodySnippet;
}

/**
 * Parses graphql data to axios syntax
 *
 * @param {Object} body graphql body data
 * @param {boolean} trim trim body option
 * @param {String} indentString indentation to be added to the snippet
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseGraphQL (body, trim, indentString, ES6_enabled) {
  var varDeclare = ES6_enabled ? 'let' : 'var';
  let query = body ? body.query : '',
    graphqlVariables = body ? body.variables : '{}',
    bodySnippet;
  return bodySnippet;
}


/* istanbul ignore next */
/**
 * parses binamry file data
 *
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseFileData (ES6_enabled) {
  var varDeclare = ES6_enabled ? 'let' : 'var',
    bodySnippet = varDeclare + ' data = \'<file contents here>\';\n';
  return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {boolean} trim trim body option
 * @param {String} indentString indentation to be added to the snippet
 * @param {String} contentType Content type of the body being sent
 * @param {boolean} ES6_enabled ES6 syntax option
 */
function parseBody (body, trim, indentString, contentType, ES6_enabled) {
  if (body && !_.isEmpty(body)) {
  
  }
  return '';
}


/**
 * parses header of request object and returns code snippet of nodejs axios to add headers
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required in code snippet
 * @returns {String} - code snippet of nodejs request to add header
 */
function parseHeader (request, indentString) {
  var headerObject = request.getHeaders({enabled: true}),
    headerArray = [];

  if (!_.isEmpty(headerObject)) {
    headerArray = _.reduce(Object.keys(headerObject), function (accumalator, key) {
      if (Array.isArray(headerObject[key])) {
        var headerValues = [];
        _.forEach(headerObject[key], (value) => {
          headerValues.push(`${sanitize(value)}`);
        });
        accumalator.push(
          indentString.repeat(2) + `'${sanitize(key, true)}': '${headerValues.join(', ')}'`
        );
      }
      else {
        accumalator.push(
          indentString.repeat(2) + `'${sanitize(key, true)}': '${sanitize(headerObject[key])}'`
        );
      }
      return accumalator;
    }, []);
  }

  return headerArray;
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader,
  parseFormData: parseFormData
};
