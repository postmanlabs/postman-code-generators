var _ = require('./lodash'),
    sanitze = require('./util').sanitze
    self;

/**
 * 
 * @param {Object} request - Postman SDK request object 
 * @param {Object} options - Options to tweak code snippet
 * @returns {String} csharp-httpclient code snippet for given request object
 */
function makeSnippet (request, options) {
    const HAS_DIRECT_CLIENT_METHOD = [ 'DELETE', 'GET', 'POST', 'PUT' ];

    var snippet = 'var client = new HttpClient();\n',
        usesSend = !HAS_DIRECT_CLIENT_METHOD.includes(request.method);

    if (usesSend) {
        snippet += 'var request = new HttpRequest();\n';
    } else {

    }


    return snippet;
}

self = module.exports = {

    /**
     * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
     *
     * @module getOptions
     *
     * @returns {Array} Additional options specific to generation of csharp-httpclient code snippet
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
            }
        ];
    },

    /**
     * Converts Postman sdk request object to csharp-httpclient code snippet
     * 
     * @module convert
     * 
     * @param {Object} request - Postman-SDK request object
     * @param {Object} options - Options to tweak code snippet generated in C#
     * @param {String} options.indentType - type for indentation eg: Space, Tab (default: Space)
     * @param {String} options.indentCount - number of spaces or tabs for indentation. (default: 4 for indentType: 
     *                                      Space, default: 1 for indentType: Tab)
     * @param {Boolean} [options.includeBoilerplate] - indicates whether to include class definition in C#
     * @param {Function} callback - Callback function with parameters (error, snippet)
     * 
     * @returns {String} Generated C# snippet via callback
     */
    convert: function (request, options, callback) {
        if (!_isFunction(callback)) {
            throw new Error('C#-HttpClient-Converter: Callback is not valid function');
        }

        // String representing value of indentation required
        var indentString,

            // snippets to include C# class definition according to options
            headerSnippet = '',
            footerSnippet = '',

            // snippet to create request in csharp-httpclient
            snippet = '';

        // TODO: Sanitize options here

        // TODO: Get this stuff from options
        indentString = options.indentType === 'Tab' ? '\t' : ' ';
        indentString = indentString.repeat(options.indentCount);

        if (options.includeBoilerplate) {
            headerSnippet = 'using System.Net.Http;\n' +
                'namespace HelloWorldApplication\n' +
                '{\n' +
                indentString + 'class HelloWorld\n' +
                indentString + '{\n' +
                indentString.repeat(2) + 'static async Task Main(string[] args)\n' +
                indentString.repeat(2) + '{\n';
            footerSnippet = indentString.repeat(2) + '}\n' +
                indentString + '}\n' +
                '}\n';
        }

        snippet = 'stuff';

        return callback(null, headerSnippet + snippet + footerSnippet);
    }
}