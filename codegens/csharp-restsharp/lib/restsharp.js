var _ = require('./lodash'),

  parseRequest = require('./parseRequest'),
  sanitize = require('./util').sanitize,
  sanitizeOptions = require('./util').sanitizeOptions,
  addFormParam = require('./util').addFormParam,
  self;

/**
 * Generates snippet in csharp-restsharp by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {Object} options - Options to tweak code snippet
 * @returns {String} csharp-restsharp code snippet for given request object
 */
function makeSnippet (request, options) {
  const UNSUPPORTED_METHODS_LIKE_POST = ['LINK', 'UNLINK', 'LOCK', 'PROPFIND'],
    UNSUPPORTED_METHODS_LIKE_GET = ['PURGE', 'UNLOCK', 'VIEW', 'COPY'];

  var snippet = `var client = new RestClient("${sanitize(request.url.toString())}");\n`,
    isUnSupportedMethod = UNSUPPORTED_METHODS_LIKE_GET.includes(request.method) ||
            UNSUPPORTED_METHODS_LIKE_POST.includes(request.method);
  if (options.requestTimeout) {
    snippet += `client.Timeout = ${options.requestTimeout};\n`;
  }
  else {
    snippet += 'client.Timeout = -1;\n';
  }
  if (!options.followRedirect) {
    snippet += 'client.FollowRedirects = false;\n';
  }
  snippet += `var request = new RestRequest(${isUnSupportedMethod ? '' : ('Method.' + request.method)});\n`;
  if (request.body && request.body.mode === 'graphql' && !request.headers.has('Content-Type')) {
    request.addHeader({
      key: 'Content-Type',
      value: 'application/json'
    });
  }
  snippet += parseRequest.parseHeader(request.toJSON(), options.trimRequestBody);
  if (request.body && request.body.mode === 'formdata') {
    let isFile = false,
      formdata = request.body.formdata,
      formdataArray = [];
    request.body.toJSON().formdata.forEach((data) => {
      if (!data.disabled && data.type === 'file') {
        isFile = true;
      }
    });
    // The following statement needs to be added else the multipart/form-data request where there is no file
    // is being sent as x-www-form-urlencoded by default
    if (!isFile) {
      snippet += 'request.AlwaysMultipartFormData = true;\n';
    }

    // The following code handles multiple files in the same formdata param.
    // It removes the form data params where the src property is an array of filepath strings
    // Splits that array into different form data params with src set as a single filepath string
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
    request.body.update({
      mode: 'formdata',
      formdata: formdataArray
    });
  }
  snippet += parseRequest.parseBody(request, options.trimRequestBody);
  if (isUnSupportedMethod) {
    (UNSUPPORTED_METHODS_LIKE_GET.includes(request.method)) &&
            (snippet += `IRestResponse response = client.ExecuteAsGet(request, "${request.method}");\n`);
    (UNSUPPORTED_METHODS_LIKE_POST.includes(request.method)) &&
            (snippet += `IRestResponse response = client.ExecuteAsPost(request, "${request.method}");\n`);
  }
  else {
    snippet += 'IRestResponse response = client.Execute(request);\n';
  }
  snippet += 'Console.WriteLine(response.Content);';

  return snippet;
}

self = module.exports = {
  /**
     * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
     *
     * @module getOptions
     *
     * @returns {Array} Additional options specific to generation of csharp-restsharp code snippet
     */
  getOptions: function () {
    return [
      {
        name: 'Include boilerplate',
        id: 'includeBoilerplate',
        type: 'boolean',
        default: false,
        description: 'Include class definition and import statements in snippet'
      },
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
        description: 'Set number of milliseconds the request should wait for a response ' +
          'before timing out (use 0 for infinity)'
      },
      {
        name: 'Follow redirects',
        id: 'followRedirect',
        type: 'boolean',
        default: true,
        description: 'Automatically follow HTTP redirects'
      },
      {
        name: 'Trim request body fields',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Remove white space and additional lines that may affect the server\'s response'
      }
    ];
  },

  /**
     * Converts Postman sdk request object to csharp-restsharp code snippet
     *
     * @module convert
     *
     * @param {Object} request - Postman-SDK request object
     * @param {Object} options - Options to tweak code snippet generated in C#
     * @param {String} options.indentType - type for indentation eg: Space, Tab (default: Space)
     * @param {String} options.indentCount - number of spaces or tabs for indentation. (default: 4 for indentType:
                                                                         Space, default: 1 for indentType: Tab)
     * @param {Boolean} [options.includeBoilerplate] - indicates whether to include class definition in C#
     * @param {Boolean} options.followRedirect - whether to enable followredirect
     * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not (default: false)
     * @param {Number} options.requestTimeout - time in milli-seconds after which request will bail out
                                                     (default: 0 -> never bail out)
     * @param {Function} callback - Callback function with parameters (error, snippet)
     * @returns {String} Generated C# snippet via callback
     */
  convert: function (request, options, callback) {

    if (!_.isFunction(callback)) {
      throw new Error('C#-RestSharp-Converter: Callback is not valid function');
    }

    //  String representing value of indentation required
    var indentString,

      //  snippets to include C# class definition according to options
      headerSnippet = '',
      footerSnippet = '',

      //  snippet to create request in csharp-restsharp
      snippet = '';

    options = sanitizeOptions(options, self.getOptions());

    indentString = options.indentType === 'Tab' ? '\t' : ' ';
    indentString = indentString.repeat(options.indentCount);

    if (options.includeBoilerplate) {
      headerSnippet = 'using System;\n' +
                            'using RestSharp;\n' +
                            'namespace HelloWorldApplication {\n' +
                            indentString + 'class HelloWorld {\n' +
                            indentString.repeat(2) + 'static void Main(string[] args) {\n';
      footerSnippet = indentString.repeat(2) + '}\n' + indentString + '}\n}\n';
    }

    snippet = makeSnippet(request, options);

    //  if boilerplate is included then two more indentString needs to be added in snippet
    (options.includeBoilerplate) &&
        (snippet = indentString.repeat(3) + snippet.split('\n').join('\n' + indentString.repeat(3)) + '\n');

    return callback(null, headerSnippet + snippet + footerSnippet);
  }
};
