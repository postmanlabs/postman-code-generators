const sanitizeString = require('./sanitize').sanitizeString,
  _ = require('../lodash');

/**
 *
 * @param {Array} array - form data array
 * @param {String} key - key of form data param
 * @param {String} type - type of form data param(file/text)
 * @param {String} val - value/src property of form data param
 * @param {String} disabled - Boolean denoting whether the param is disabled or not
 * @param {String} contentType - content type header of the param
 *
 * Appends a single param to form data array
 */
function addFormParam (array, key, type, val, disabled, contentType) {
  if (type === 'file') {
    array.push({
      key: key,
      type: type,
      src: val,
      disabled: disabled,
      contentType: contentType
    });
  }
  else {
    array.push({
      key: key,
      type: type,
      value: val,
      disabled: disabled,
      contentType: contentType
    });
  }
}

/**
* parses a body to the corresponding snippet
*
* @param {object} body - postman request body
* @returns {String}
*/
function solveMultiFile (body) {
  if (body && body.mode === 'formdata') {
    let formdata = body.formdata,
      formdataArray = [];
    formdata.members.forEach((param) => {
      let key = param.key,
        type = param.type,
        disabled = param.disabled,
        contentType = param.contentType;
      // check if type is file or text
      if (type === 'file') {
        // if src is not of type string we check for array(multiple files)
        if (typeof param.src !== 'string') {
          // if src is an array(not empty), iterate over it and add files as separate form fields
          if (Array.isArray(param.src) && param.src.length) {
            param.src.forEach((filePath) => {
              addFormParam(formdataArray, key, param.type, filePath, disabled, contentType);
            });
          }
          // if src is not an array or string, or is an empty array, add a placeholder for file path(no files case)
          else {
            addFormParam(formdataArray, key, param.type, '/path/to/file', disabled, contentType);
          }
        }
        // if src is string, directly add the param with src as filepath
        else {
          addFormParam(formdataArray, key, param.type, param.src, disabled, contentType);
        }
      }
      // if type is text, directly add it to formdata array
      else {
        addFormParam(formdataArray, key, param.type, param.value, disabled, contentType);
      }
    });

    body.update({
      mode: 'formdata',
      formdata: formdataArray
    });
  }
  return body;
}

/**
 * Parses Raw data
 *
 * @param {Object} body body object from request.
 * @param {String} indentation indentation to be added to the snippet
 * @param {boolean} bodyTrim trim body option
 * @param {String} contentType Content type of the body being sent
 * @returns {String} snippet of the body generation
 */
function parseRawBody (body, indentation, bodyTrim, contentType) {
  let bodySnippet = '';
  if (contentType && (contentType === 'application/json' || contentType.match(/\+json$/))) {
    try {
      let jsonBody = JSON.parse(body);
      bodySnippet += `${JSON.stringify(jsonBody, null, indentation.length)};`;
    }
    catch (error) {
      bodySnippet += `'${sanitizeString(body.toString(), bodyTrim)}';`;
    }
  }
  else {
    bodySnippet += `'${sanitizeString(body.toString(), bodyTrim)}';`;
  }
  return bodySnippet;
}

/**
 * Parses URL encoded body
 *
 * @param {Object} body body object from request.
 * @param {String} indentation indentation to be added to the snippet
 * @param {boolean} bodyTrim trim body option
 * @returns {String} snippet of the body generation
 */
function parseURLEncodedBody (body, indentation, bodyTrim) {
  let enabledBodyList = _.reject(body.members, 'disabled'),
    bodySnippet = '';
  if (!_.isEmpty(enabledBodyList)) {
    let bodyDataMap = _.map(enabledBodyList, (data) => {
      return `${indentation}'${sanitizeString(data.key, bodyTrim)}' => '${sanitizeString(data.value, bodyTrim)}'`;
    });
    bodySnippet += `[\n'form_params' => [\n${bodyDataMap.join(',\n')}\n]];`;
  }
  return bodySnippet;
}

/**
 * Parses form data
 *
 * @param {Object} body body object from request.
 * @param {String} indentation indentation to be added to the snippet
 * @param {boolean} bodyTrim trim body option
 * @returns {String} snippet of the body generation
 */
function parseFormData (body, indentation, bodyTrim) {
  let enabledBodyList = _.reject(body.members, 'disabled'),
    bodySnippet = '';
  if (!_.isEmpty(enabledBodyList)) {
    let bodyDataMap = _.map(enabledBodyList, (data) => {
      let name = `${indentation.repeat(2)}[\n${indentation.repeat(3)}` +
      `'name' => '${sanitizeString(data.key, bodyTrim)}',\n` +
        `${indentation.repeat(3)}'contents' => '${sanitizeString(data.value, bodyTrim)}` +
        `'\n${indentation.repeat(2)}]`;
      return name;
    });
    bodySnippet += `[\n${indentation}'multipart' => [\n${bodyDataMap.join(',\n')}\n]];`;
  }
  return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {String} indentation indentation to be added to the snippet
 * @param {boolean} bodyTrim trim body option
 * @param {String} contentType Content type of the body being sent
 */
function processBodyModes (body, indentation, bodyTrim, contentType) {
  switch (body.mode) {
    case 'urlencoded':
      return parseURLEncodedBody(body.urlencoded, indentation, bodyTrim);
    case 'raw':
      return parseRawBody(body.raw, indentation, bodyTrim, contentType);
    // case 'graphql':
    //   return parseGraphQL(body.graphql, trim, bodyTrim, ES6_enabled);
    case 'formdata':
      return parseFormData(body.formdata, indentation, bodyTrim);
    // case 'file':
    //   return parseFileData();
    default:
      return parseRawBody(body.raw, indentation, bodyTrim, contentType);
  }
}

/**
* parses a body to the corresponding snippet
*
* @param {object} body - postman request body
* @param {string} indentation - indentation character
* @param {boolean} bodyTrim trim body option
* @param {String} contentType Content type of the body being sent
* @returns {String} snippet of the body generation
*/
function parseBody (body, indentation, bodyTrim, contentType) {
  let snippet = '';
  if (body && !_.isEmpty(body)) {
    body = solveMultiFile(body);
    snippet += `$body = ${processBodyModes(body, indentation, bodyTrim, contentType)}\n`;
  }
  return snippet;
}

module.exports = {
  parseBody
};
