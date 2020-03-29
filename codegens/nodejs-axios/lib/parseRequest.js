var _ = require('./lodash'),
  sanitize = require('./util').sanitize;
  // path = require('path');


/**
 * Parses URLEncoded body from request to axios syntax
 *
 * @param {Object} body URLEncoded Body
 * @param {boolean} trim trim body option
 */
function parseURLEncodedBody (body, trim) {
  var bodySnippet = 'const qs = require(\'qs\')\n',
      dataArray = [];

  _.forEach(body, function (data) {
    if (!data.disabled) {
      dataArray.push(`'${sanitize(data.key, trim)}': '${sanitize(data.value, trim)}'`)
    }
  });
  bodySnippet += `const data = qs.stringify({\n ${dataArray.join(',\n')} \n});`;
  return bodySnippet;
}

/**
 * Parses Formdata from request to axios syntax
 *
 * @param {Object} body FormData body
 * @param {boolean} trim trim body option
 */
function parseFormData (body, trim) {
  var bodySnippet = 'const FormData = require(\'form-data\')\n';
  bodySnippet += 'const data = new FormData();\n';
  // check if there's file
  const fileArray = body.filter(function(item){ return !item.disabled && item.type === 'file'})
  if (fileArray.length > 0) {
    bodySnippet += 'const fs = require(\'fs\')\n';
  }
  _.forEach(body, function (data) {
    if (!data.disabled) {
      if (data.type === 'file') {
        // var pathArray = data.src.split(path.sep),
        //   fileName = pathArray[pathArray.length - 1],
          var fileContent = `fs.createReadStream("${data.src}")`
          // options = `{ knownLength: fs.statSync("${data.src}").size }`;
          bodySnippet += `data.append("${sanitize(data.key, trim)}", ${fileContent});\n`;
      }
      else {
        bodySnippet += `data.append("${sanitize(data.key, trim)}", "${sanitize(data.value, trim)}");\n`;
      }
    }
  });
  return bodySnippet;
}

/**
 * Parses Raw data to axios syntax
 *
 * @param {Object} body Raw body data
 * @param {boolean} trim trim body option
 * @param {String} contentType Content type of the body being sent
 */
function parseRawBody (body, trim, contentType) {
  var bodySnippet = 'const data = ';
  if (contentType === 'application/json') {
    try {
      let jsonBody = JSON.parse(body);
      bodySnippet += `JSON.stringify(${JSON.stringify(jsonBody)});\n`;
    }
    catch (error) {
      bodySnippet += `"${sanitize(body.toString(), trim)}";\n`;
    }
  }
  else {
    bodySnippet += `"${sanitize(body.toString(), trim)}";\n`;
  }
  return bodySnippet;
}

/**
 * Parses graphql data to axios syntax
 *
 * @param {Object} body graphql body data
 * @param {boolean} trim trim body option
 * @param {String} indentString indentation to be added to the snippet
 */
function parseGraphQL (body, trim, indentString) {
  let query = body.query,
    graphqlVariables,
    bodySnippet;
  try {
    graphqlVariables = JSON.parse(body.variables);
  }
  catch (e) {
    graphqlVariables = {};
  }
  bodySnippet = 'const data = JSON.stringify({\n';
  bodySnippet += `${indentString}query: "${sanitize(query, trim)}",\n`;
  bodySnippet += `${indentString}variables: ${JSON.stringify(graphqlVariables)}\n})`;
  return bodySnippet;
}


/* istanbul ignore next */
/**
 * parses binamry file data
 */
function parseFileData () {
  var bodySnippet = 'const data = "<file contents here>";\n';
  return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {boolean} trim trim body option
 * @param {String} indentString indentation to be added to the snippet
 * @param {String} contentType Content type of the body being sent
 */
function parseBody (body, trim, indentString, contentType) {
  if (!_.isEmpty(body)) {
    switch (body.mode) {
      case 'urlencoded':
        return parseURLEncodedBody(body.urlencoded, trim);
      case 'raw':
        return parseRawBody(body.raw, trim, contentType);
      case 'graphql':
        return parseGraphQL(body.graphql, trim, indentString);
      case 'formdata':
        return parseFormData(body.formdata, trim);
        /* istanbul ignore next */
      case 'file':
        return parseFileData(body.file, trim);
      default:
        return parseRawBody(body[body.mode], trim);
    }
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
    // headerSnippet = indentString + '\'headers\': {\n';
    headerArray = []

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
    }, [])
  }
  // headerSnippet += indentString + '}';

  return headerArray;
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader,
  parseFormData: parseFormData
};
