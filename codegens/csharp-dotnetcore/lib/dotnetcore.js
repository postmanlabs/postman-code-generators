var _ = require('./lodash'),

  parseRequest = require('./parseRequest'),
  sanitize = require('./util').sanitize,
  sanitizeOptions = require('./util').sanitizeOptions,
  self;

/**
 * Generates snippet in csharp-dotnetcore by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {Object} options - Options to tweak code snippet
 * @returns {String} csharp-dotnetcore code snippet for given request object
 */
function makeSnippet (request, options) {
  var snippet = 'HttpClientHandler clientHandler = new HttpClientHandler();\n';
  // Check if redirects should be followed or not
  if (!options.followRedirect) {
    snippet += 'clientHandler.AllowAutoRedirect = false;\n';
  }

  snippet += 'HttpClient client = new HttpClient(clientHandler);\n';

  if (options.requestTimeout > 0) {
    // Postman uses milliseconds as the base unit for request timeout time.
    snippet += `client.Timeout = TimeSpan.FromMilliseconds(${options.requestTimeout});\n`;
  }
  else if (options.requestTimeout === 0) {
    // A value of 0 as the request timeout in Postman means wait forever.
    snippet += 'client.Timeout = Timeout.InfiniteTimeSpan;\n';
  }

  // Generate the main section of the code snippet.
  snippet += `HttpRequestMessage request = new HttpRequestMessage(new HttpMethod("${request.method}"), ` +
              `"${sanitize(request.url.toString())}");\n`;
  snippet += parseRequest.parseHeader(request.toJSON(), options.trimRequestBody);
  snippet += parseRequest.parseBody(request, options.trimRequestBody);
  snippet += 'HttpResponseMessage response = await client.SendAsync(request);\n' +
  'string responseBody = await response.Content.ReadAsStringAsync();\n' +
  'Console.WriteLine(responseBody);\n';

  return snippet;
}

self = module.exports = {
  /**
     * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
     *
     * @module getOptions
     *
     * @returns {Array} Additional options specific to generation of csharp-dotnetcore code snippet
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
        availableOptions: ['tab', 'space'],
        default: 'space',
        description: 'Character used for indentation'
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
      },
      {
        name: 'Body trim',
        id: 'trimRequestBody',
        type: 'boolean',
        default: true,
        description: 'Trim request body fields'
      }
    ];
  },

  /**
     * Converts Postman sdk request object to csharp-dotnetcore code snippet
     *
     * @module convert
     *
     * @param {Object} request - Postman-SDK request object
     * @param {Object} options - Options to tweak code snippet generated in C#
     * @param {String} options.indentType - type for indentation eg: space, tab (default: space)
     * @param {String} options.indentCount - number of spaces or tabs for indentation. (default: 4 for indentType:
                                                                         space, default: 1 for indentType: tab)
     * @param {Boolean} [options.includeBoilerplate] - indicates whether to include class defination in C#
     * @param {Boolean} options.followRedirect - whether to enable followredirect
     * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not (default: false)
     * @param {Number} options.requestTimeout - time in milli-seconds after which request will bail out
                                                     (default: 0 -> never bail out)
     * @param {Function} callback - Callback function with parameters (error, snippet)
     * @returns {String} Generated C# snippet via callback
     */
  convert: function (request, options, callback) {

    if (!_.isFunction(callback)) {
      throw new Error('C#-DotNetCore-Converter: Callback is not valid function');
    }

    //  String representing value of indentation required
    var indentString,

      //  snippets to include C# class definition according to options
      headerSnippet = '',
      footerSnippet = '',

      //  snippet to create request in csharp-dotnetcore
      snippet = '';

    options = sanitizeOptions(options, self.getOptions());

    indentString = options.indentType === 'tab' ? '\t' : ' ';
    indentString = indentString.repeat(options.indentCount);

    if (options.includeBoilerplate) {
      headerSnippet = 'using System;\n' +
                      'using System.Collections.Generic;\n' +
                      'using System.IO;\n' +
                      'using System.Net.Http;\n' +
                      'using System.Net.Http.Headers;\n' +
                      'using System.Text;\n' +
                      'using System.Threading.Tasks;\n' +
                      'namespace HttpRequests {\n' +
                      indentString + 'class Program {\n' +
                      indentString.repeat(2) + 'static void Main(string[] args) {\n' +
                      indentString.repeat(3) + 'Request().Wait();\n' +
                      indentString.repeat(2) + '}\n' +
                      indentString.repeat(2) + 'static async Task Request() {\n';
      footerSnippet = indentString.repeat(2) + '}\n' + indentString + '}\n}\n';
    }

    snippet = makeSnippet(request, options);

    //  if boilerplate is included then two more indentString needs to be added in snippet
    (options.includeBoilerplate) &&
        (snippet = indentString.repeat(3) + snippet.split('\n').join('\n' + indentString.repeat(3)) + '\n');

    return callback(null, headerSnippet + snippet + footerSnippet);
  }
};
