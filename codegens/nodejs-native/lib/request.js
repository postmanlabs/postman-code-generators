const _ = require('./lodash'),
    sanitizeOptions = require('./util').sanitizeOptions,

    parseRequest = require('./parseRequest');
var self,
    defaultOptions = {};

/**
 * retuns snippet of nodejs(native) by parsing data from Postman-SDK request object
 * 
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options
 * @returns {String} - nodejs(native) code snippet for given request object 
 */
function makeSnippet (request, indentString, options) {
    var nativeModule = (request.url.protocol === 'http' ? 'http' : 'https'),
        snippet = `var ${nativeModule} = require('${nativeModule}');\n\n`,
        optionsArray = [],
        postData = [];

    if (options.followRedirect) {
        snippet = `var ${nativeModule} = require('follow-redirects').${nativeModule};\n\n`;
    }

    if (_.get(request, 'body.mode') && request.body.mode === 'urlencoded') {
        snippet += 'var qs = require(\'querystring\');\n\n';
    }

    snippet += 'var options = {\n';

    /** 
     * creating string to represent options object using optionArray.join()
     * example:
     *  options: {
     *      method: 'GET',
     *      hostname: 'www.google.com',
     *      path: '/x?a=10',
     *      headers: {
     *          'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
     *      } 
     *  }
     */
    if (request.body && request.body[request.body.mode]) {
        postData.push(parseRequest.parseBody(request.body.toJSON(), indentString, options.trimRequestBody));
    }

    parseRequest.parseURLVariable(request);

    optionsArray.push(indentString + `'method': '${request.method}'`);
    optionsArray.push(parseRequest.parseHost(request, indentString));
    optionsArray.push(parseRequest.parsePath(request, indentString));
    optionsArray.push(parseRequest.parseHeader(request, indentString));

    if (options.followRedirect) {
        optionsArray.push(indentString + '\'maxRedirects\': 20 // sets the maximum number of allowed ' +
            'redirect; default 20');
    }

    snippet += optionsArray.join(',\n') + '\n';
    snippet += '};\n\n';

    snippet += `var req = ${nativeModule}.request(options, function (res) {\n`;

    snippet += indentString + 'var chunks = [];\n\n';
    snippet += indentString + 'res.on("data", function (chunk) {\n';
    snippet += indentString.repeat(2) + 'chunks.push(chunk);\n';
    snippet += indentString + '});\n\n';

    snippet += indentString + 'res.on("end", function (chunk) {\n';
    snippet += indentString.repeat(2) + 'var body = Buffer.concat(chunks);\n';
    snippet += indentString.repeat(2) + 'console.log(body.toString());\n';
    snippet += indentString + '});\n\n';

    snippet += indentString + 'res.on("error", function (error) {\n';
    snippet += indentString.repeat(2) + 'console.error(error);\n';
    snippet += indentString + '});\n';

    snippet += '});\n\n';

    if (request.body && !(_.isEmpty(request.body)) && postData.length) {
        snippet += `var postData = ${postData};\n\n`;

        if (request.method === 'DELETE') {
            snippet += `req.setHeader('Content-Length', postData.length);\n\n`;
        }

        if (request.body.mode === 'formdata') {
            snippet += 'req.setHeader(\'content-type\',' +
            ' \'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\');\n\n';
        }

        snippet += 'req.write(postData);\n\n';
    }

    if (options.requestTimeout) {
        snippet += `req.setTimeout(${options.requestTimeout}, function() {\n`;
        snippet += indentString + 'req.abort();\n';
        snippet += '});\n\n';
    }

    snippet += 'req.end();';

    return snippet;
}

/**
 * Converts Postman sdk request object to nodejs native code snippet
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
self = module.exports = {
    /**
     * Used to return options which are specific to a particular plugin
     *
     * @returns {Array}
     */
    getOptions: function () {
        return [{
            name: 'Indent Count',
            id: 'indentCount',
            type: 'positiveInteger',
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
            type: 'positiveInteger',
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
        }];
    },

    convert: function (request, options, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('NodeJS-Request-Converter: callback is not valid function');
        }
        self.getOptions().forEach((option) => {
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
};
