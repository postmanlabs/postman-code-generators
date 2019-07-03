var _ = require('./lodash'),

    parseRequest = require('./parseRequest'),
    sanitize = require('./util').sanitize,
    sanitizeOptions = require('./util').sanitizeOptions,
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

    snippet += `var request = new RestRequest(${isUnSupportedMethod ? '' : ('Method.' + request.method)});\n`;
    snippet += parseRequest.parseHeader(request.toJSON(), options.trimRequestBody);
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
                name: 'Include Boilerplate',
                id: 'includeBoilerplate',
                type: 'boolean',
                default: false,
                description: 'Boolean denoting whether to include class definition and import statements in snippet'
            },
            {
                name: 'Indent Count',
                id: 'indentCount',
                type: 'integer',
                default: 2,
                description: 'Integer denoting count of indentation required'
            },
            {
                name: 'Indent type',
                id: 'indentType',
                type: 'enum',
                availableOptions: ['tab', 'space'],
                default: 'space',
                description: 'String denoting type of indentation for code snippet. eg: \'space\', \'tab\''
            },
            {
                name: 'Request Timeout',
                id: 'requestTimeout',
                type: 'integer',
                default: 0,
                description: 'Integer denoting time after which the request will bail out in milliseconds'
            },
            {
                name: 'Follow redirect',
                id: 'followRedirect',
                type: 'boolean',
                default: true,
                description: 'Boolean denoting whether or not to automatically follow redirects'
            },
            {
                name: 'Body trim',
                id: 'trimRequestBody',
                type: 'boolean',
                default: true,
                description: 'Boolean denoting whether to trim request body fields'
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
            throw new Error('C#-RestSharp-Converter: Callback is not valid function');
        }

        //  String representing value of indentation required
        var indentString,
            expectedOptions = {},

            //  snippets to include C# class definition according to options
            headerSnippet = '',
            footerSnippet = '',

            //  snippet to create request in csharp-restsharp
            snippet = '';

        self.getOptions().forEach((option) => {
            expectedOptions[option.id] = {
                default: option.default,
                type: option.type
            };
            if (option.type === 'enum') {
                expectedOptions[option.id].availableOptions = option.availableOptions;
            }
        });
        options = sanitizeOptions(options, expectedOptions);

        indentString = options.indentType === 'tab' ? '\t' : ' ';
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
