const _ = require('./lodash'),

  sanitize = require('./util').sanitize,
  path = require('path');

/**
 * parses body of request when type of the request body is formdata or urlencoded and
 * returns code snippet for nodejs to add body
 *
 * @param {Array<Object>} dataArray - array containing body elements of request
 * @param {String} indentString - string required for indentation
 * @param {Boolean} trimBody - indicates whether to trim body or not
 */
function extractFormData (dataArray, indentString, trimBody) {
  if (!dataArray) {
    return '';
  }
  var snippetString = _.reduce(dataArray, (accumalator, item) => {
    if (item.disabled) {
      return accumalator;
    }

    accumalator.push(
      indentString + `'${sanitize(item.key, trimBody)}': '${sanitize(item.value, trimBody)}'`
    );

    return accumalator;
  }, []);
  return snippetString.join(',\n');
}

/**
 * Generates multipart form data snippet
 *
 * @param {*} requestbody
 */
function generateMultipartFormData (requestbody) {
  const boundary = '------WebKitFormBoundary7MA4YWxkTrZu0gW\\r\\nContent-Disposition: form-data; ',
    dataArray = requestbody[requestbody.mode];
  var postData = '';

  if (dataArray.length) {
    postData = '"' + boundary + _.reduce(dataArray, (accumalator, dataArrayElement) => {
      if (!dataArrayElement.disabled || dataArrayElement.disabled === false) {
        const key = dataArrayElement.key.replace(/"/g, '\'');

        if (dataArrayElement.type === 'file') {
          var pathArray = dataArrayElement.src.split(path.sep),
            fileName = pathArray[pathArray.length - 1];
          const filename = `filename=\\"${fileName}\\"`,
            contentType = 'Content-Type: \\"{Insert_File_Content_Type}\\"',
            fileContent = `fs.readFileSync('${dataArrayElement.src}')`;

          // eslint-disable-next-line max-len
          accumalator.push(`name=\\"${key}\\"; ${filename}\\r\\n${contentType}\\r\\n\\r\\n" + ${fileContent} + "\\r\\n`);
        }
        else {
          // eslint-disable-next-line no-useless-escape
          const value = dataArrayElement.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          accumalator.push(`name=\\"${key}\\"\\r\\n\\r\\n${value}\\r\\n`);
        }
      }
      return accumalator;
      // eslint-disable-next-line no-useless-escape
    }, []).join(`${boundary}`) + '------WebKitFormBoundary7MA4YWxkTrZu0gW--\"';
  }

  return postData;
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
    switch (requestbody.mode) {
      case 'raw':
        if (contentType === 'application/json') {
          try {
            let jsonBody = JSON.parse(requestbody[requestbody.mode]);
            return `JSON.stringify(${JSON.stringify(jsonBody)})`;
          }
          catch (error) {
            return ` ${JSON.stringify(requestbody[requestbody.mode])}`;
          }
        }
        return ` ${JSON.stringify(requestbody[requestbody.mode])}`;
      case 'graphql':
        // eslint-disable-next-line no-case-declarations
        let query = requestbody[requestbody.mode].query,
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(requestbody[requestbody.mode].variables);
        }
        catch (e) {
          graphqlVariables = {};
        }
        return 'JSON.stringify({\n' +
        `${indentString}query: \`${query.trim()}\`,\n` +
        `${indentString}variables: ${JSON.stringify(graphqlVariables)}\n})`;
      case 'formdata':
        return generateMultipartFormData(requestbody);
      case 'urlencoded':
        return `qs.stringify({\n${extractFormData(requestbody[requestbody.mode], indentString, trimBody)}` +
                    '\n})';
      case 'file':
        return '"<file contents here>"';
      default:
        return '';
    }
  }
  return '';
}

/**
 * parses header of request object and returns code snippet of nodejs native to add header
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required in code snippet
 * @returns {String} - code snippet of nodejs native to add header
 */
function parseHeader (request, indentString) {
  var headerObject = request.getHeaders({enabled: true}),
    headerSnippet = indentString + '\'headers\': {\n';

  if (headerObject) {
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
    }, []).join(',\n');
  }

  if (headerObject && !_.isEmpty(headerObject)) {
    headerSnippet += '\n';
  }

  headerSnippet += indentString + '}';
  return headerSnippet;
}


module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader
};
