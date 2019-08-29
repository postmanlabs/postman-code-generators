var _ = require('./lodash'),
  sanitize = require('./util').sanitize,
  sanitizeOptions = require('./util').sanitizeOptions,
  self;

/**
 * Parses Raw data from request to fetch syntax
 *
 * @param {Object} body - Raw body data
 * @param {String} mode - Request body type (i.e. raw, urlencoded, formdata, file)
 * @param {boolean} trim - trim body option
 * @returns {String} request body in the desired format
 */
function parseRawBody (body, mode, trim) {
  var bodySnippet;
  bodySnippet = `let postData = ref ${sanitize(body, mode, trim)};;\n\n`;
  return bodySnippet;
}

/**
 * Parses URLEncoded body from request to fetch syntax
 *
 * @param {Object} body - URLEncoded Body
 * @param {String} mode - Request body type (i.e. raw, urlencoded, formdata, file)
 * @param {boolean} trim - trim body option
 * @returns {String} request body in the desired format
 */
function parseURLEncodedBody (body, mode, trim) {
  var payload, bodySnippet;
  payload = _.reduce(body, function (accumulator, data) {
    if (!data.disabled) {
      accumulator.push(`${sanitize(data.key, mode, trim)}=${sanitize(data.value, mode, trim)}`);
    }
    return accumulator;
  }, []).join('&');

  bodySnippet = `let postData = ref "${payload}";;\n\n`;
  return bodySnippet;
}

/**
 * Parses formData body from request to fetch syntax
 *
 * @param {Object} body - formData Body
 * @param {boolean} trim - trim body option
 * @param {String} indent - indentation string
 * @returns {String} request body in the desired format
 */
function parseFormData (body, trim, indent) {
  var parameters = '[|\n' + _.reduce(body, (accumalator, data) => {
      if (!data.disabled || data.disabled === false) {
        const key = sanitize(data.key, 'formdata-key', trim);

        /* istanbul ignore next */
        if (data.type === 'file') {
          const filename = 'filename';
          accumalator.push(`${indent}[| ("name", "${key}"); ("fileName", "${filename}") |]`);
        }
        else {
          const value = sanitize(data.value, 'formdata-value', trim);
          accumalator.push(`${indent}[| ("name", "${key}"); ("value", "${value}") |]`);
        }
      }
      return accumalator;
      // eslint-disable-next-line no-useless-escape
    }, []).join(';\n') + '\n|];;',
    bodySnippet = '';

  bodySnippet = `let parameters = ${parameters}\n`;
  bodySnippet += 'let boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";;\n';
  bodySnippet += 'let postData = ref "";;\n\n';
  bodySnippet += 'for x = 0 to Array.length parameters - 1 do\n';
  bodySnippet += `${indent}let (_, paramName) = parameters.(x).(0) in\n`;
  bodySnippet += `${indent}let (paramType, _) = parameters.(x).(1) in\n`;
  bodySnippet += `${indent}let accum = "--" ^ boundary ^ "\\r\\n" ^ "Content-Disposition: form-data; `;
  bodySnippet += 'name=\\"" ^ paramName ^ "\\"" in\n';
  bodySnippet += `${indent}if paramType = "value" then (\n`;
  bodySnippet += `${indent.repeat(2)}let (_, paramValue) = parameters.(x).(1) in\n`;
  bodySnippet += `${indent.repeat(2)}postData := !postData ^ accum ^ "\\r\\n\\r\\n" ^ paramValue ^ "\\r\\n";\n`;
  bodySnippet += `${indent})\n`;
  bodySnippet += `${indent}else if paramType = "fileName" then (\n`;
  bodySnippet += `${indent.repeat(2)}postData := !postData ^ accum ^ "; filename=\\"{your filepath}\\"\\r\\n";\n`;
  bodySnippet += `${indent.repeat(2)}postData := !postData ^ "Content-Type: {your file's content-type}`;
  bodySnippet += `\\r\\n\\r\\n\\r\\n";\n${indent})\n`;
  bodySnippet += 'done;;\n';
  bodySnippet += 'postData := !postData ^ "--" ^ boundary ^ "--"\n\n';
  return bodySnippet;
}

/* istanbul ignore next */
/**
 * Parses file body from the Request
 *
 * @param {String} indent - indentation string
 * @returns {String} request body in the desired format
 */
function parseFile (indent) {
  var bodySnippet = 'let load_file f =\n';
  bodySnippet += `${indent}let ic = open_in f in\n`;
  bodySnippet += `${indent}let n = in_channel_length ic in\n`;
  bodySnippet += `${indent}let s = Bytes.create n in\n`;
  bodySnippet += `${indent}really_input ic s 0 n;\n`;
  bodySnippet += `${indent}close_in ic;\n${indent}(s)\n\n`;
  bodySnippet += 'let postData = ref "";;\n';
  bodySnippet += 'postData := load_file("{Insert_File_Name}");;\n\n';
  return bodySnippet;
}

/**
 * Parses Body from the Request using
 *
 * @param {Object} body - body object from request.
 * @param {boolean} trim - trim body option
 * @param {String} indent - indentation string
 * @returns {String} utility function for getting request body in the desired format
 */
function parseBody (body, trim, indent) {
  if (!_.isEmpty(body) && (!_.isEmpty(body[body.mode]))) {
    switch (body.mode) {
      case 'urlencoded':
        return parseURLEncodedBody(body.urlencoded, body.mode, trim);
      case 'raw':
        return parseRawBody(body.raw, body.mode, trim);
      case 'formdata':
        return parseFormData(body.formdata, trim, indent);
        /* istanbul ignore next */
      case 'file':
        return parseFile(indent);
      default:
        return '';
    }
  }
  return '';
}

/**
 * Parses headers from the request.
 *
 * @param {String} bodyMode - request body type i.e. formdata, file etc.
 * @param {Object} headers - headers from the request.
 * @param {String} indent - indent indent string
 * @returns {String} request headers in the desired format
 */
function parseHeaders (bodyMode, headers, indent) {
  var headerSnippet = '';
  if (!_.isEmpty(headers)) {
    headerSnippet += `${indent}let headers = Header.init ()\n`;
    _.forEach(headers, function (value, key) {
      headerSnippet += `${indent.repeat(2)}|> fun h -> Header.add h "${sanitize(key, 'header')}" `;
      headerSnippet += `"${sanitize(value, 'header')}"\n`;
    });
  }
  if (bodyMode === 'formdata' || bodyMode === 'file') {
    if (headerSnippet === '') {
      headerSnippet += `${indent}let headers = Header.init ()\n`;
    }
    if (bodyMode === 'formdata') {
      headerSnippet += `${indent.repeat(2)}|> fun h -> Header.add h "content-type" "multipart/form-data;`;
      headerSnippet += ' boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"\n';
    }
    // Ignoring next part as this header is specific to body type file. and there is no test for it.
    /* istanbul ignore next */
    else {
      headerSnippet += `${indent.repeat(2)}|> fun h -> Header.add h "content-type"`;
      headerSnippet += ' "{Insert_File_Content_Type}"\n';
    }
  }
  return headerSnippet;
}

/**
 * Gets request method argument to pass for ocaml call function
 *
 * @param {String} method - method type of request
 * @returns {String} Method argument for ocaml call function
 */
function getMethodArg (method) {
  var methodArg = '',
    supportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
    flag = false;

  _.forEach(supportedMethods, (value) => {
    if (value === method) {
      flag = true;
    }
  });

  if (flag) {
    methodArg = '`' + method;
  }
  else {
    methodArg = `(Code.method_of_string "${method}")`;
  }
  return methodArg;
}

self = module.exports = {
  /**
     * Used in order to get options for generation of OCaml code snippet
     *
     * @module getOptions
     *
     * @returns {Array} Options specific to generation of OCaml-Cohttp code snippet
     */
  getOptions: function () {
    return [
      {
        name: 'Indent count',
        id: 'indentCount',
        type: 'positiveInteger',
        default: 2,
        description: 'Number of indentation characters to add per code level'
      },
      {
        name: 'Indent type',
        id: 'indentType',
        type: 'enum',
        availableOptions: ['Tab', 'Space'],
        default: 'Space',
        description: 'Character used for indentation'
      },
      {
        name: 'Body trim',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Trim request body fields'
      },
      {
        name: 'Request timeout',
        id: 'requestTimeout',
        type: 'positiveInteger',
        default: 0,
        description: 'How long the request should wait for a response before timing out (milliseconds)'
      },
      {
        name: 'Follow redirect',
        id: 'followRedirect',
        type: 'boolean',
        default: true,
        description: 'Automatically follow HTTP redirects'
      }
    ];
  },

  /**
    * Used to convert the postman sdk-request object in OCaml-Cohttp request snippet
    *
    * @module convert
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options
    * @param  {String} options.indentType - type of indentation eg: Space / Tab (default: Space)
    * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: Space,
                                                                    default: 1 for indentType: Tab)
    * @param {Number} options.requestTimeout - time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.trimRequestBody - whether to trim request body fields (default: false)
    * @param {Boolean} options.followRedirect - whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    * @returns {String} - returns generated Ocaml snippet via callback
    */
  convert: function (request, options, callback) {

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }
    else if (!_.isFunction(callback)) {
      throw new Error('OCaml-Cohttp-Converter: callback is not valid function');
    }
    options = sanitizeOptions(options, self.getOptions());

    var codeSnippet, indent, trim, finalUrl, methodArg, // timeout, followRedirect,
      bodySnippet = '',
      headerSnippet = '',
      requestBody = (request.body ? request.body.toJSON() : {}),
      requestBodyMode = (request.body ? request.body.mode : 'raw');

    indent = options.indentType === 'Tab' ? '\t' : ' ';
    indent = indent.repeat(options.indentCount);
    // timeout = options.requestTimeout;
    // followRedirect = options.followRedirect;
    trim = options.trimRequestBody;
    finalUrl = encodeURI(request.url.toString());
    methodArg = getMethodArg(request.method);
    headerSnippet += parseHeaders(requestBodyMode, request.getHeaders({enabled: true}), indent);
    bodySnippet = parseBody(requestBody, trim, indent);

    // Starting to add in codeSnippet
    codeSnippet = 'open Lwt\nopen Cohttp\nopen Cohttp_lwt_unix\n\n';
    if (bodySnippet !== '') {
      codeSnippet += bodySnippet;
    }
    codeSnippet += 'let reqBody = \n';
    codeSnippet += `${indent}let uri = Uri.of_string "${finalUrl}" in\n`;
    if (headerSnippet !== '') {
      codeSnippet += headerSnippet;
      codeSnippet += `${indent}in\n`;
    }
    if (bodySnippet !== '') {
      codeSnippet += `${indent}let body = Cohttp_lwt.Body.of_string !postData in\n\n`;
    }
    codeSnippet += `${indent}Client.call `;
    if (headerSnippet !== '') {
      codeSnippet += '~headers ';
    }
    if (bodySnippet !== '') {
      codeSnippet += '~body ';
    }
    codeSnippet += `${methodArg} uri >>= fun (resp, body) ->\n`;
    codeSnippet += `${indent}body |> Cohttp_lwt.Body.to_string >|= fun body -> body\n\n`;
    codeSnippet += 'let () =\n';
    codeSnippet += `${indent}let respBody = Lwt_main.run reqBody in\n`;
    codeSnippet += `${indent}print_endline (respBody)`;
    return callback(null, codeSnippet);
  }
};
