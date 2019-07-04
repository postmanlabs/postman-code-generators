var _ = require('./lodash'),

    parseRequest = require('./parseRequest'),
    sanitize = require('./util').sanitize,
    sanitizeOptions = require('./util').sanitizeOptions,
    defaultOptions = {};

/**
 * retuns snippet of nodejs(request) by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options
 * @returns {String} - nodejs(request) code snippet for given request object
 */
function makeSnippet (request, indentString, options) {
    var snippet = 'var request = require(\'request\');\n',
        optionsArray = [];

    snippet += 'var fs = require(\'fs\')\n';
    snippet += 'var options = {\n';

    /**
     * creating string to represent options object using optionArray.join()
     * example:
     *  options: {
     *      method: 'GET',
     *      url: 'www.google.com',
     *      timeout: 1000
     *  }
     */
    optionsArray.push(indentString + `'method': '${request.method}'`);
    optionsArray.push(indentString + `'url': '${sanitize(request.url.toString())}'`);

    optionsArray.push(parseRequest.parseHeader(request, indentString));

    if (request.body && request.body[request.body.mode]) {
        optionsArray.push(
            indentString + parseRequest.parseBody(request.body.toJSON(), indentString, options.trimRequestBody)
        );
    }
    if (options.requestTimeout) {
        optionsArray.push(indentString + `timeout: ${options.requestTimeout},`);
    }
    if (options.followRedirect === false) {
        optionsArray.push(indentString + 'followRedirect: false');
    }
    snippet += optionsArray.join(',\n') + '\n';
    snippet += '}\n';

    snippet += 'request(options, function (error, response) { \n';
    snippet += indentString + 'if (error) throw new Error(error);\n';
    snippet += indentString + 'console.log(response.body);\n';
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
}

/**
 * Converts Postman sdk request object to nodejs request code snippet
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
        throw new Error('NodeJS-Request-Converter: callback is not valid function');
    }
    getOptions().forEach((option) => {
        defaultOptions[option.id] = {
            default: option.default,
            type: option.type
        };
        if (option.type === 'enum') {
            defaultOptions[option.id].availableOptions = option.availableOptions;
        }
    });
    options = sanitizeOptions(options, defaultOptions);

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
