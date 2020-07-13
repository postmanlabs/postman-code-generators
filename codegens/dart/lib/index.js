var _ = require('./lodash'),
  sanitizeOptions = require('./util').sanitizeOptions,
  sanitize = require('./util').sanitize,
  addFormParam = require('./util').addFormParam,
  self;

function getArrayBody (body, bodyString, indent) {
  let insideOfBody = [];
  body.forEach((item) => {
    let keys = Object.keys(item);
    let values = Object.values(item);

    for (let i = 0; i < keys.length; i++) {
      let value = values[i];
      if (typeof value === 'string') {
        insideOfBody.push(`{ '${keys[i]}': '${value}' }`);
      }
      else {
        insideOfBody.push(`{ '${keys[i]}': ${value} }`);
      }
    }
  });
  bodyString = insideOfBody.join(',\n' + indent);
  return bodyString;
}

/**
 * Parses Raw data
 *
 * @param {Object} body Raw body data
 * @param {String} indent indentation required for code snippet
 * @param {Boolean} trim indicates whether to trim string or not
 */
function parseRawBody (body, indent, trim) {
  var bodySnippet = '';

  if (Object.keys(body).length === 0) {
    return bodySnippet;
  }

  bodySnippet += 'var body = {\n';
  let bodyString = body.toString();
  let items = '';

  if (Array.isArray(body)) {
    items = getArrayBody(body, bodyString, indent);
  }
  else if (typeof body === 'string') {
    bodyString = body;
    if (body.includes('$') && !body.includes('\\$')) {
      bodyString = body.replace('$', '\\$');
    }
    return 'final String body = \'\'\'' + bodyString + '\'\'\';\n';
  }
  else {
    items = sanitize(bodyString, trim)
      .replace('}', '')
      .replace('{', '')
      .split(',').join(',\n' + indent);
  }

  bodySnippet += indent + items + '\n';
  bodySnippet += '};\n';
  return bodySnippet;
}

/**
 * Parses GraphQL body
 *
 * @param {Object} body GraphQL body
 * @param {String} indent indentation required for code snippet
 * @param {Boolean} trim indicates whether to trim string or not
 */
function parseGraphQLBody (body, indent, trim) {
  var bodySnippet = '',
    rawBody = JSON.stringify(body);

  bodySnippet += `var body = '${rawBody}';\n`;

  return bodySnippet;
}

/**
 * Parses URLEncoded body
 *
 * @param {Object} body URLEncoded Body
 * @param {String} indent indentation required for code snippet
 * @param {Boolean} trim indicates whether to trim string or not
 */
function parseURLEncodedBody (body, indent, trim) {
  let bodySnippet = '',
    key,
    value,
    first = true;
  _.forEach(body, function (data) {
    if (!data.disabled) {
      key = trim ? data.key.trim() : data.key;
      value = trim ? data.value.trim() : data.value;
      if (first) {
        bodySnippet += 'NSMutableData *postData = [[NSMutableData alloc] initWithData:[@"' +
        sanitize(key, true) + '=' + sanitize(value, trim) + '" dataUsingEncoding:NSUTF8StringEncoding]];\n';
      }
      else {
        bodySnippet += '[postData appendData:[@"&' + sanitize(key, true) + '=' + sanitize(value, trim) +
        '" dataUsingEncoding:NSUTF8StringEncoding]];\n';
      }
      first = false;
    }
  });
  bodySnippet += '[request setHTTPBody:postData];\n';
  return bodySnippet;
}

function isFileFormData (body) {
  if (!body || body.mode !== 'formdata') {
    return false;
  }

  if (!Array.isArray(body.formdata)) {
    return false;
  }

  return body.formdata.some((k) => { return k.type === 'file'; });
}

/**
 * Parses form data body from request
 *
 * @param {Object} body form data Body
 * @param {String} indent indentation required for code snippet
 * @param {Boolean} trim indicates whether to trim string or not
 */
function parseFormData (body, indent, trim) {
  let bodySnippet = '',
    formDataArray = [],
    formDataFileArray = [],
    key,
    foundFile = false,
    value;

  if (_.isEmpty(body)) {
    return bodySnippet;
  }

  _.forEach(body, function (data) {
    key = trim ? data.key.trim() : data.key;
    value = trim ? data.value.trim() : data.value;
    if (!data.disabled) {
      if (data.type === 'file') {
        foundFile = true;
        formDataFileArray.push(`request.files.add(await http.MultipartFile.fromPath('${key}', '${data.src}'));`);
      }
      else {
        formDataArray.push(`${indent}'${key}': '${sanitize(value, trim)}'`);
      }
    }
  });

  if (formDataArray.length > 0) {
    bodySnippet += 'var body = {\n';
    bodySnippet += formDataArray.join(',\n');
    bodySnippet += ' \n};\n';
    if (foundFile) {
      bodySnippet += 'request.fields.addAll(x);\n';
    }
  }

  if (foundFile) {
    bodySnippet += formDataFileArray.join('\n');
  }

  return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {String} indent indentation required for code snippet
 * @param {trim} trim indicates whether to trim string or not
 */
function parseBody (body, indent, trim) {
  if (!_.isEmpty(body)) {
    switch (body.mode) {
      case 'urlencoded':
        return parseRawBody(body.urlencoded, indent, trim);
      case 'raw':
        return parseRawBody(body.raw, indent, trim);
      case 'formdata':
        return parseFormData(body.formdata, indent, trim);
      case 'file':
        return '';
      case 'graphql':
        return parseGraphQLBody(body.graphql, indent, trim);
      default:
        return '<file-content-here>';
    }
  }
  return '';
}

/**
 * Parses headers from the request.
 *
 * @param {Object} headersArray array containing headers
 * @param {String} indent indentation required for code snippet
 * @param {Boolean} trim indicates whether to trim string or not
 */
function parseHeaders (headersArray, indent, trim) {
  var headerString = '',
    headerDictionary = [];
  if (_.isEmpty(headersArray)) {
    return headerString;
  }

  headerString += 'var headers = {\n';

  _.forEach(headersArray, function (header) {
    if (!header.disabled) {
      headerDictionary.push(indent + '\'' + header.key + '\': \'' + sanitize(header.value, trim) + '\'');
    }
  });

  headerString += headerDictionary.join(',\n');
  headerString += '\n};\n';

  return headerString;
}

self = module.exports = {
  convert: function (request, options, callback) {
    var indent,
      codeSnippet = '',
      headerSnippet = 'import \'dart:convert\';\nimport \'package:http/http.dart\' as http;\n\n',
      footerSnippet = '',
      trim;
    options = sanitizeOptions(options, self.getOptions());
    trim = options.trimRequestBody;
    indent = options.indentType === 'tab' ? '\t' : ' ';
    indent = indent.repeat(options.indentCount);

    if (!_.isFunction(callback)) {
      throw new Error('Callback is not valid function');
    }

    if (request.body && !request.headers.has('Content-Type')) {
      if (request.body.mode === 'file') {
        request.addHeader({
          key: 'Content-Type',
          value: 'text/plain'
        });
      }
      else if (request.body.mode === 'graphql') {
        request.addHeader({
          key: 'Content-Type',
          value: 'application/json'
        });
      }
    }

    // The following code handles multiple files in the same formdata param.
    // It removes the form data params where the src property is an array of filepath strings
    // Splits that array into different form data params with src set as a single filepath string
    if (request.body && request.body.mode === 'formdata') {
      let formdata = request.body.formdata,
        formdataArray = [];
      formdata.members.forEach((param) => {
        let key = param.key,
          type = param.type,
          disabled = param.disabled,
          contentType = param.contentType;
        if (type === 'file') {
          if (typeof param.src !== 'string') {
            if (Array.isArray(param.src) && param.src.length) {
              param.src.forEach((filePath) => {
                addFormParam(formdataArray, key, param.type, filePath, disabled, contentType);
              });
            }
            else {
              addFormParam(formdataArray, key, param.type, '/path/to/file', disabled, contentType);
            }
          }
          else {
            addFormParam(formdataArray, key, param.type, param.src, disabled, contentType);
          }
        }
        else {
          addFormParam(formdataArray, key, param.type, param.value, disabled, contentType);
        }
      });
      request.body.update({
        mode: 'formdata',
        formdata: formdataArray
      });
    }

    var headerParam = ', headers: headers';
    const headers = parseHeaders(request.headers.toJSON(), indent, trim);
    codeSnippet += headers;
    if (headers === '') {
      headerParam = '';
    }

    const requestBody = request.body ? request.body.toJSON() : {};
    const body = parseBody(requestBody, indent, trim) + '\n';

    if (isFileFormData(requestBody)) {
      codeSnippet += `http.MultipartRequest request = http.MultipartRequest('${request.method.toUpperCase()}',` +
        `"${encodeURI(request.url.toString())}");\n`;

      codeSnippet += body;

      if (headers !== '') {
        codeSnippet += 'request.headers.addAll(headers);';
      }

      codeSnippet += '\n';

      codeSnippet += 'http.StreamedResponse response = await request.send();\n';
      codeSnippet += 'if (response.statusCode == 200) {\n';
      codeSnippet += `${indent}print(await response.stream.bytesToString());\n`;
      codeSnippet += '} else {\n';
      codeSnippet += `${indent}print(response.reasonPhrase);\n`;
      codeSnippet += '}\n';
    }
    else {
      codeSnippet += body;

      let bodyParam = ', body: body';
      if (typeof body === undefined || body.trim() === '') {
        bodyParam = '';
      }

      codeSnippet += `final response = await http.${request.method.toLowerCase()}("` +
        encodeURI(request.url.toString()) + `"${headerParam}${bodyParam});\n`;
      codeSnippet += 'if (response.statusCode == 200) {\n';
      codeSnippet += `${indent}print(json.decode(response.body));\n`;
      codeSnippet += '} else {\n';
      codeSnippet += `${indent}print(response.reasonPhrase);\n`;
      codeSnippet += '}\n';
    }

    //  if boilerplate is included then two more indent needs to be added in snippet
    (options.includeBoilerplate) &&
    (codeSnippet = indent + codeSnippet.split('\n').join('\n' + indent) + '\n');

    callback(null, headerSnippet + codeSnippet + footerSnippet);
  },
  getOptions: function () {
    return [
      {
        name: 'Set indentation count',
        id: 'indentCount',
        type: 'positiveInteger',
        default: 2,
        description: 'Set the number of indentation characters to add per code level'
      },
      {
        name: 'Set indentation type',
        id: 'indentType',
        type: 'enum',
        availableOptions: ['Tab', 'Space'],
        default: 'Space',
        description: 'Select the character used to indent lines of code'
      },
      {
        name: 'Set request timeout',
        id: 'requestTimeout',
        type: 'positiveInteger',
        // Using 10 secs as default
        // TODO: Find out a way to set infinite timeout.
        default: 10000,
        description: 'Set number of milliseconds the request should wait for a response' +
    ' before timing out (use 0 for infinity)'
      },
      {
        name: 'Trim request body fields',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Remove white space and additional lines that may affect the server\'s response'
      },
      {
        name: 'Include boilerplate',
        id: 'includeBoilerplate',
        type: 'boolean',
        default: false,
        description: 'Include class definition and import statements in snippet'
      }
    ];
  }
};
