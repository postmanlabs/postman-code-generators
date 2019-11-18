var _ = require('./lodash'),
  sanitizeOptions = require('./util').sanitizeOptions,
  sanitize = require('./util').sanitize,
  self;

/**
 * Parses Raw data to fetch syntax
 *
 * @param {Object} body Raw body data
 * @param {String} indent Indent
 * @param {Boolean} trim Trim request body if this is true.
 */
function parseRawBody (body, indent, trim) {
  var bodySnippet = '';
  bodySnippet += 'NSData *postData = [[NSData alloc] initWithData:[@"' + sanitize(body.toString(), trim) + '" ' +
  'dataUsingEncoding:NSUTF8StringEncoding]];\n';
  bodySnippet += '[request setHTTPBody:postData];\n';
  return bodySnippet;
}

/**
 * Parses GraphQL body
 *
 * @param {Object} body GraphQL body
 * @param {String} indent Indent
 * @param {Boolean} trim Trim request body if this is true.
 */
function parseGraphqlBody (body, indent, trim) {
  var bodySnippet = '',
    rawBody = JSON.stringify(body);
  bodySnippet += 'NSData *postData = [[NSData alloc] initWithData:[@"' + sanitize(rawBody, trim) + '" ' +
  'dataUsingEncoding:NSUTF8StringEncoding]];\n';
  bodySnippet += '[request setHTTPBody:postData];\n';
  return bodySnippet;
}

/**
 * Parses URLEncoded body from request to fetch syntax
 *
 * @param {Object} body URLEncoded Body
 * @param {String} indent Indent
 * @param {Boolean} trim Trim request body is this true.
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
        key + '=' + sanitize(value, trim) + '" dataUsingEncoding:NSUTF8StringEncoding]];\n';
      }
      else {
        bodySnippet += '[postData appendData:[@"&' + key + '=' + sanitize(value, trim) +
        '" dataUsingEncoding:NSUTF8StringEncoding]];\n';
      }
      first = false;
    }
  });
  bodySnippet += '[request setHTTPBody:postData];\n';
  return bodySnippet;
}

/**
 * Parses URLEncoded body from request to fetch syntax
 *
 * @param {Object} body URLEncoded Body
 * @param {String} indent Indent
 * @param {Boolean} trim Trim request body is this true.
 */
function parseFormData (body, indent, trim) {
  let bodySnippet = '',
    key,
    value,
    first = true;

  _.forEach(body, function (data) {
    key = trim ? data.key.trim() : data.key;
    value = trim ? data.value.trim() : data.value;
    if (!data.disabled) {
      if (first) {
        bodySnippet += 'NSArray *parameters = @[';
      }
      if (!first) {
        bodySnippet += ', ';
      }
      first = false;
      if (data.type === 'file') {
        if (Array.isArray(data.src)) {
          data.src.forEach((src) => {
            bodySnippet += `\n${indent}@{ @"name": @"${key}", @"fileName": @"${src}" }`;
          });
        }
        else {
          bodySnippet += `\n${indent}@{ @"name": @"${key}", @"fileName": @"${data.src}" }`;
        }
      }
      else {
        bodySnippet += `\n${indent}@{ @"name": @"${key}", @"value": @"${sanitize(value, trim)}" }`;
      }
    }
  });
  bodySnippet += ' ];\n';
  bodySnippet += 'NSString *boundary = @"----WebKitFormBoundary7MA4YWxkTrZu0gW";\n';
  bodySnippet += 'NSError *error;\n';
  bodySnippet += 'NSMutableString *body = [NSMutableString string];\n';
  bodySnippet += 'for (NSDictionary *param in parameters) {\n';
  bodySnippet += indent + '[body appendFormat:@"--%@\\r\\n", boundary];\n';
  bodySnippet += indent + 'if (param[@"fileName"]) {\n';
  // eslint-disable-next-line max-len
  bodySnippet += indent.repeat(2) + '[body appendFormat:@"Content-Disposition:form-data; name="%@"; filename="%@"\\r\\n", param[@"name"], param[@"fileName"]];\n';
  bodySnippet += indent.repeat(2) + '[body appendFormat:@"Content-Type: %@\\r\\n\\r\\n", param[@"contentType"]];\n';
  bodySnippet += indent.repeat(2) + '[body appendFormat:@"%@", [NSString stringWithContentsOfFile:param[@"fileName"]';
  bodySnippet += indent.repeat(2) + ' encoding:NSUTF8StringEncoding error:&error]];\n';
  bodySnippet += indent.repeat(2) + 'if (error) {\n';
  bodySnippet += indent.repeat(3) + 'NSLog(@"%@", error);\n';
  bodySnippet += indent.repeat(2) + '}\n';
  bodySnippet += indent + '} else {\n';
  // eslint-disable-next-line max-len
  bodySnippet += indent.repeat(2) + '[body appendFormat:@"Content-Disposition:form-data; name="%@"\\r\\n\\r\\n", param[@"name"]];\n';
  bodySnippet += indent.repeat(2) + '[body appendFormat:@"%@", param[@"value"]];\n';
  bodySnippet += indent + '}\n';
  bodySnippet += '}\n';
  bodySnippet += '[body appendFormat:@"\\r\\n--%@--\\r\\n", boundary];\n';
  bodySnippet += 'NSData *postData = [body dataUsingEncoding:NSUTF8StringEncoding];\n';
  bodySnippet += '[request setHTTPBody:postData];\n';
  return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {String} indent
 * @param {trim} trim
 */
function parseBody (body, indent, trim) {
  if (!_.isEmpty(body)) {
    switch (body.mode) {
      case 'urlencoded':
        return parseURLEncodedBody(body.urlencoded, indent, trim);
      case 'raw':
        return parseRawBody(body.raw, indent, trim);
      case 'formdata':
        return parseFormData(body.formdata, indent, trim);
      case 'file':
        return '';
      case 'graphql':
        return parseGraphqlBody(body.graphql, indent, trim);
      default:
        return '';
    }
  }
  return '';
}

/**
 * Parses headers from the request.
 *
 * @param {Object} obj
 * @param {String} indent
 * @param {Boolean} trim
 */
function parseHeaders (obj, indent, trim) {
  let headers = '';
  if (_.isEmpty(obj)) {
    return headers;
  }
  headers = indent + 'NSDictionary *headers = @{\n';
  var first = true;
  _.forEach(obj, function (value, key) {
    if (!first) {
      headers += ',\n';
    }
    first = false;
    headers += indent.repeat(2) + '@"' + key + '": @"' + sanitize(value, trim) + '"';
  });
  headers += '\n' + indent + '};\n';
  headers += indent + '[request setAllHTTPHeaderFields:headers];\n';
  return headers;
}

self = module.exports = {
  convert: function (request, options, callback) {
    var indent,
      codeSnippet,
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
    let obj = {};
    codeSnippet = '#import <Foundation/Foundation.h>\n';
    codeSnippet += 'NSMutableURLRequest *request = [NSMutableURLRequest';
    codeSnippet += 'requestWithURL:[NSURL URLWithString:@"' + encodeURI(request.url.toString()) + '"]\n';
    codeSnippet += `${indent}cachePolicy:NSURLRequestUseProtocolCachePolicy\n`;
    codeSnippet += `${indent}timeoutInterval:10.0];\n`;
    codeSnippet += parseHeaders(Object.assign(obj, request.getHeaders({enabled: true})), indent, trim);
    codeSnippet += parseBody(request.body ? request.body.toJSON() : {}, indent, trim) + '\n';
    codeSnippet += '[request setHTTPMethod:@"' + request.method + '"];\n';
    codeSnippet += 'NSURLSession *session = [NSURLSession sharedSession];\n';
    codeSnippet += 'NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request\n';
    codeSnippet += 'completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {\n';
    codeSnippet += `${indent}if (error) {\n`;
    codeSnippet += `${indent.repeat(2)}NSLog(@"%@", error);\n`;
    codeSnippet += `${indent}} else {\n`;
    codeSnippet += `${indent.repeat(2)}NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;\n`;
    codeSnippet += `${indent.repeat(2)}NSLog(@"%@", httpResponse);\n`;
    codeSnippet += `${indent}}\n`;
    codeSnippet += '}];\n';
    codeSnippet += '[dataTask resume];';

    callback(null, codeSnippet);
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
        default: 0,
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
        name: 'Follow redirects',
        id: 'followRedirect',
        type: 'boolean',
        default: true,
        description: 'Automatically follow HTTP redirects'
      }
    ];
  }
};
