var _ = require('./lodash'),

  sanitize = require('./util').sanitize,
  path = require('path');

/**
 * parses body of request when type of the request body is formdata or urlencoded and
 * returns code snippet for nodejs to add body
 *
 * @param {Array<Object>} dataArray - array containing body elements of request
 * @param {String} indentString - string required for indentation
 * @param {Boolean} trimBody - indicates whether to trim body or not
 * @param {String} requestType - indicates whether the requestBody is to be parsed as urlencoded or formdata
 */
function extractFormData (dataArray, indentString, trimBody, requestType) {
  if (!dataArray) {
    return '';
  }
  var snippetString = _.reduce(dataArray, (accumalator, item) => {
    if (item.disabled) {
      return accumalator;
    }
    /* istanbul ignore next */
    if (item.type === 'file') {
      /**
             * creating snippet to send file in nodejs request
             * for example:
             *  'fieldname': {
             *      'value': fs.createStream('filename.ext'),
             *      'options': {
             *          'filename': 'filename.ext',
             *          'contentType: null
             *          }
             *      }
             *  }
             */
      if (Array.isArray(item.src) && item.src.length) {
        let fileSnippet = '';
        _.forEach(item.src, (filePath) => {
          fileSnippet += indentString + `.attach('${sanitize(item.key, trimBody)}',
            '${sanitize(filePath, trimBody)}')\n`;
        });
        if (fileSnippet !== '') {
          accumalator.push(fileSnippet);
        }
        else {
          return accumalator;
        }
      }
      else if (typeof item.src !== 'string') {
        accumalator.push(indentString + `.attach('${sanitize(item.key, trimBody)}', '/path/to/file')`);
      }
      else {
        var pathArray = item.src.split(path.sep),
          fileName = pathArray[pathArray.length - 1];
        accumalator.push(indentString + `.attach('${sanitize(item.key, trimBody)}', 
              '${sanitize(item.src, trimBody)}', '${sanitize(fileName, trimBody)}')`);
      }
    }
    else if (requestType === 'urlencoded') {
      accumalator.push(indentString +
        `.send({'${sanitize(item.key, trimBody)}':'${sanitize(item.value, trimBody)}'})`);
    }
    else if (requestType === 'formdata') {
      accumalator.push(indentString +
        `.field('${sanitize(item.key, trimBody)}', '${sanitize(item.value, trimBody)}')`);
    }
    return accumalator;
  }, []);
  return snippetString.join('\n');
}

/**
 * Parses body object based on mode of body and returns code snippet
 *
 * @param {Object} requestbody - json object for body of request
 * @param {String} indentString - string for indentation
 * @param {Boolean} trimBody - indicates whether to trim body fields or not
 * @param {String} contentType Content type of the body being sent
 */
function parseBody (requestbody, indentString, trimBody, contentType) {
  if (requestbody) {
    var bodySnippet = indentString;
    switch (requestbody.mode) {
      case 'raw':
        if (contentType === 'application/json') {
          try {
            let jsonBody = JSON.parse(requestbody[requestbody.mode]);
            bodySnippet += `.send(JSON.stringify(${JSON.stringify(jsonBody)}))\n`;
            break;
          }
          catch (error) {
            bodySnippet += `.send(${JSON.stringify(requestbody[requestbody.mode])})\n`;
            break;
          }
        }
        bodySnippet += `.send(${JSON.stringify(requestbody[requestbody.mode])})\n`;
        break;
      // eslint-disable-next-line no-case-declarations
      case 'graphql':
        let query = requestbody[requestbody.mode].query,
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(requestbody[requestbody.mode].variables);
        }
        catch (e) {
          graphqlVariables = {};
        }
        bodySnippet += '.send(JSON.stringify({\n' +
          `${indentString.repeat(2)}query: '${sanitize(query, trimBody)}',\n` +
          `${indentString.repeat(2)}variables: ${JSON.stringify(graphqlVariables)}\n` +
          `${indentString}}))\n`;
        break;
      case 'formdata':
        bodySnippet = `${extractFormData(requestbody[requestbody.mode], indentString, trimBody, requestbody.mode)}`;
        break;
      case 'urlencoded':
        bodySnippet += `.type('form')\n${extractFormData(requestbody[requestbody.mode],
          indentString, trimBody, requestbody.mode)}\n`;
        break;
        /* istanbul ignore next */
      case 'file':
        // return 'formData: {\n' +
        //                 extractFormData(requestbody[requestbody.mode], indentString, trimBody) +
        //                 indentString + '}';
        bodySnippet += '.send("<file contents here>")\n';
        break;
      default:
        bodySnippet = '';
    }
    return bodySnippet;
  }
  return '';
}

/**
 * parses header of request object and returns code snippet of nodejs request to add header
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required in code snippet
 * @returns {String} - code snippet of nodejs request to add header
 */
function parseHeader (request, indentString) {
  var headerObject = request.getHeaders({enabled: true}),
    headerSnippet = `${indentString}.set({\n`;

  if (!_.isEmpty(headerObject)) {
    headerSnippet += _.reduce(Object.keys(headerObject), function (accumalator, key) {
      if (Array.isArray(headerObject[key])) {
        var headerValues = [];
        _.forEach(headerObject[key], (value) => {
          headerValues.push(`'${sanitize(value)}'`);
        });
        accumalator.push(
          indentString.repeat(2) + `'${sanitize(key, true)}': [${headerValues.join(', ')}]`
        );
      }
      else {
        accumalator.push(
          indentString.repeat(2) + `'${sanitize(key, true)}': '${sanitize(headerObject[key])}'`
        );
      }
      return accumalator;
    }, []).join(',\n') + '\n';
  }
  else {
    return '';
  }

  headerSnippet += indentString + '})\n';
  return headerSnippet;
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader
};
