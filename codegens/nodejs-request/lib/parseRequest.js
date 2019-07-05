var _ = require('./lodash'),

  sanitize = require('./util').sanitize;

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
      accumalator.push([
        indentString.repeat(2) + `'${sanitize(item.key, trimBody)}': {`,
        indentString.repeat(3) + `'value': fs.createReadStream('${sanitize(item.src, trimBody)}'),`,
        indentString.repeat(3) + '\'options\': {',
        indentString.repeat(4) + `'filename': '${sanitize(item.src, trimBody)}',`,
        indentString.repeat(4) + '\'contentType\': null',
        indentString.repeat(3) + '}',
        indentString.repeat(2) + '}'
      ].join('\n'));
    }
    else {
      accumalator.push(
        indentString.repeat(2) +
                `'${sanitize(item.key, trimBody)}': '${sanitize(item.value, trimBody)}'`
      );
    }
    return accumalator;
  }, []);
  return snippetString.join(',\n') + '\n';
}

/**
 * Parses body object based on mode of body and returns code snippet
 * 
 * @param {Object} requestbody - json object for body of request
 * @param {String} indentString - string for indentation
 * @param {Boolean} trimBody - indicates whether to trim body fields or not
 */
function parseBody (requestbody, indentString, trimBody) {
  if (requestbody) {
    switch (requestbody.mode) {
      case 'raw':
        return `body: ${JSON.stringify(requestbody[requestbody.mode])}\n`;
      case 'formdata':
        return `formData: {\n${extractFormData(requestbody[requestbody.mode], indentString, trimBody)}` +
                        indentString + '}';
      case 'urlencoded':
        return `form: {\n${extractFormData(requestbody[requestbody.mode], indentString, trimBody)}` +
                        indentString + '}';
        /* istanbul ignore next */
      case 'file':
        return 'formData: {\n' +
                        extractFormData([{type: 'file', key: 'file', src: requestbody[requestbody.mode].src}]) +
                        indentString + '}';
      default:
        return '';
    }
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
    headerSnippet = indentString + '\'headers\': {\n';

  if (!_.isEmpty(headerObject)) {
    headerSnippet += _.reduce(Object.keys(headerObject), function (accumalator, key) {
      accumalator.push(
        indentString.repeat(2) + `'${sanitize(key)}': '${sanitize(headerObject[key])}'`
      );
      return accumalator;
    }, []).join(',\n') + '\n';
  }

  headerSnippet += indentString + '}';
  return headerSnippet;
}

module.exports = {
  parseBody: parseBody,
  parseHeader: parseHeader
};
