var _ = require('./lodash'),
    sanitize = require('./util').sanitize;

/**
 * Parses URLEncoded body from request
 *
 * @param {*} body URLEncoded Body
 */
function parseURLEncodedBody (body) {
    var payload = [],
        bodySnippet;
    _.forEach(body, function (data) {
        if (!data.disabled) {
            payload.push(`${escape(data.key)}=${escape(data.value)}`);
        }
    });
    bodySnippet = `var data = "${payload.join('&')}";\n`;
    return bodySnippet;
}

/**
 * Parses Raw data
 *
 * @param {*} body Raw body data
 * @param {*} trim trim body option
 */
function parseRawBody (body, trim) {
    var bodySnippet;
    bodySnippet = `var data = "${sanitize(body.toString(), trim)}";\n`;
    return bodySnippet;
}

/**
 * Parses formData body from request
 *
 * @param {*} body formData Body
 * @param {*} trim trim body option
 */
function parseFormData (body, trim) {
    var bodySnippet = 'var data = new FormData();\n';
    _.forEach(body, (data) => {
        if (!(data.disabled)) {
            /* istanbul ignore next */
            /* ignoring because the file src is not stored in postman collection" */
            if (data.type === 'file') {
                bodySnippet += `data.append("${sanitize(data.key, trim)}", "${sanitize(data.src, trim)}", `;
                bodySnippet += `"${sanitize(data.key, trim)}");\n`;
            }
            else {
                bodySnippet += `data.append("${sanitize(data.key, trim)}", "${sanitize(data.value, trim)}");\n`;
            }
        }
    });
    return bodySnippet;
}

/* istanbul ignore next */
/* ignoring because source of file is not stored in postman collection */
/**
 * Parses file body from the Request
 *
 * @param {*} body body object from request.
 * @param {*} trim trim body option
 */
function parseFile (body, trim) {
    var bodySnippet = 'var data = new FormData();\n';
    bodySnippet += `data.append("${sanitize(body.key, trim)}", "${sanitize(body.src, trim)}", `;
    bodySnippet += `"${sanitize(body.key, trim)}");\n`;
    return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {*} body body object from request.
 * @param {*} trim trim body option
 */
function parseBody (body, trim) {
    if (!_.isEmpty(body)) {
        switch (body.mode) {
            case 'urlencoded':
                return parseURLEncodedBody(body.urlencoded, trim);
            case 'raw':
                return parseRawBody(body.raw, trim);
            case 'formdata':
                return parseFormData(body.formdata, trim);
            case 'file':
                return parseFile(body.file, trim);
            default:
                return 'var data = null;\n';
        }
    }
    return 'var data = null;\n';
}

/**
 * Parses headers from the request.
 *
 * @param {Object} headers headers from the request.
 */
function parseHeaders (headers) {
    var headerSnippet = '';
    if (!_.isEmpty(headers)) {
        _.forEach(headers, function (value, key) {
            headerSnippet += `xhr.setRequestHeader("${key}", "${value}");\n`;
        });
    }
    return headerSnippet;
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
            type: 'integer',
            default: 0,
            description: 'Number of indentation characters to add per code level'
        },
        {
            name: 'Indent type',
            id: 'indentType',
            type: 'enum',
            availableOptions: ['tab', 'space'],
            default: 'tab',
            description: 'Character used for indentation'
        },
        {
            name: 'Request timeout',
            id: 'requestTimeout',
            type: 'integer',
            default: 0,
            description: 'How long the request should wait for a response before timing out (milliseconds)'
        },
        {
            name: 'Body trim',
            id: 'trimRequestBody',
            type: 'boolean',
            default: true,
            description: 'Automatically follow HTTP redirects'
        }
    ];
}

/**
 * @description Converts Postman sdk request object to nodejs(unirest) code snippet
 * @param {Object} request - postman-SDK request object
 * @param {Object} options
 * @param {String} options.indentType - type for indentation eg: space, tab
 * @param {String} options.indentCount - number of spaces or tabs for indentation.
 * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not
 * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
 * @param {Function} callback - callback function with parameters (error, snippet)
 */
function convert (request, options, callback) {

    if (!_.isFunction(callback)) {
        throw new Error('JS-XHR-Converter: callback is not valid function');
    }

    var indent, trim, headerSnippet,
        codeSnippet = '',
        bodySnippet = '';
    indent = options.indentType === 'tab' ? '\t' : ' ';
    indent = indent.repeat(options.indentCount);
    trim = options.trimRequestBody;

    bodySnippet = parseBody(request.body.toJSON(), trim, indent);

    codeSnippet += bodySnippet + '\n';

    codeSnippet += 'var xhr = new XMLHttpRequest();\nxhr.withCredentials = true;\n\n';

    codeSnippet += 'xhr.addEventListener("readystatechange", function() {\n';
    codeSnippet += `${indent}if(this.readyState === 4) {\n`;
    codeSnippet += `${indent.repeat(2)}console.log(this.responseText);\n`;
    codeSnippet += `${indent}}\n});\n\n`;

    codeSnippet += `xhr.open("${request.method}", "${encodeURI(request.url.toString())}");\n`;

    headerSnippet = parseHeaders(request.getHeaders({enabled: true}));

    codeSnippet += headerSnippet + '\n';

    codeSnippet += 'xhr.send(data);';

    callback(null, codeSnippet);
}

module.exports = {
    convert: convert,
    getOptions: getOptions
};
