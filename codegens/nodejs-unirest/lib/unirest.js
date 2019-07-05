var _ = require('./lodash'),
    sanitizeOptions = require('./util').sanitizeOptions,

    parseRequest = require('./parseRequest');

/**
 * retuns snippet of nodejs(unirest) by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options
 * @returns {String} - nodejs(unirest) code snippet for given request object
 */
function makeSnippet (request, indentString, options) {
    var snippet = 'var unirest = require(\'unirest\');\n';

    snippet += `var req = unirest('${request.method}', '${request.url.toString()}')\n`;

    snippet += parseRequest.parseHeader(request, indentString);

    if (request.body) {
        snippet += parseRequest.parseBody(request.body.toJSON(), indentString, options);
    }
    if (options.requestTimeout) {
        snippet += indentString + `.timeout(${options.requestTimeout})`;
    }
    if (options.followRedirect === false) {
        snippet += indentString + '.followRedirect(false)\n';
    }

    snippet += '.end(function (res) { \n';
    snippet += indentString + 'if (res.err) console.log(res.err);\n';
    snippet += indentString + 'console.log(JSON.stringify(res.body));\n';
    snippet += '});\n';

    return snippet;
}

/**
 * Used to get the options specific to this codegen
 *
 * @returns {Array} - Returns an array of option objects
 */
function getOptions () {
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
}

/**
 * Converts Postman sdk request object to nodejs(unirest) code snippet
 *
 * @param {Object} request - postman-SDK request object
 * @param {Object} options
 * @param {String} options.indentType - type for indentation eg: space, tab
 * @param {String} options.indentCount - number of spaces or tabs for indentation.
 * @param {Boolean} options.followRedirect - whether to enable followredirect
 * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not
 * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
 * @param {Function} callback - callback function with parameters (error, snippet)
 */
function convert (request, options, callback) {
    if (!_.isFunction(callback)) {
        throw new Error('Nodejs-Unirest-Converter: callback is not valid function');
    }
    options = sanitizeOptions(options, getOptions());

    //  String representing value of indentation required
    var indentString;

    indentString = options.indentType === 'tab' ? '\t' : ' ';
    indentString = indentString.repeat(options.indentCount);

    return callback(null, makeSnippet(request, indentString, options));
}

module.exports = {
    convert: convert,
    getOptions: getOptions
};
