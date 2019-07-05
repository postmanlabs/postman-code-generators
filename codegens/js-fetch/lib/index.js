var _ = require('./lodash'),
    sanitize = require('./util').sanitize,
    sanitizeOptions = require('./util').sanitizeOptions,
    defaultOptions = {};
const VALID_BODY_MODES = ['urlencoded', 'raw', 'file', 'formdata'];

/**
 * Adds mode of redirection in fetch.
 *
 * @param {boolean} redirect to determine whether to follow redirects or not.
 */
function redirectMode (redirect) {
    if (redirect) {
        return 'follow';
    }
    return 'manual';
}

/**
 * Parses URLEncoded body from request to fetch syntax
 *
 * @param {Object} body URLEncoded Body
 * @param {boolean} trim trim body option
 */
function parseURLEncodedBody (body, trim) {
    var bodySnippet = 'var urlencoded = new URLSearchParams();\n';
    _.forEach(body, function (data) {
        if (!data.disabled) {
            bodySnippet += `urlencoded.append("${sanitize(data.key, trim)}", "${sanitize(data.value, trim)}");\n`;
        }
    });
    return bodySnippet;
}

/**
 * Parses Formdata from request to fetch syntax
 *
 * @param {Object} body FormData body
 * @param {boolean} trim trim body option
 */
function parseFormData (body, trim) {
    var bodySnippet = 'var formdata = new FormData();\n';
    _.forEach(body, function (data) {
        if (!data.disabled) {
            if (data.type === 'file') {
                bodySnippet += `formdata.append("${sanitize(data.key, trim)}", "${sanitize(data.src, trim)}");\n`;
            }
            else {
                bodySnippet += `formdata.append("${sanitize(data.key, trim)}", "${sanitize(data.value, trim)}");\n`;
            }
        }
    });
    return bodySnippet;
}

/**
 * Parses Raw data to fetch syntax
 *
 * @param {Object} body Raw body data
 * @param {boolean} trim trim body option
 */
function parseRawBody (body, trim) {
    var bodySnippet = `var raw = "${sanitize(body.toString(), trim)}";\n`;
    return bodySnippet;
}


/* istanbul ignore next */
/**
 *
 * @param {Object} body File body.
 */
function parseFileData (body) {
    var bodySnippet = `var file = "${body.content}";\n`;
    return bodySnippet;
}

/**
 * Parses Body from the Request
 *
 * @param {Object} body body object from request.
 * @param {boolean} trim trim body option
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
            /* istanbul ignore next */
            case 'file':
                return parseFileData(body.file, trim);
            default:
                return parseRawBody(body[body.mode], trim);
        }
    }
    return '';
}

/**
 * Parses headers from the request.
 *
 * @param {Object} headers headers from the request.
 */
function parseHeaders (headers) {
    var headerSnippet = '';
    if (!_.isEmpty(headers)) {
        headerSnippet = 'var myHeaders = new Headers();\n';
        _.forEach(headers, function (value, key) {
            headerSnippet += `myHeaders.append('${key}', '${value}');\n`;
        });
    }
    else {
        headerSnippet = '';
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
        }
    ];
}

/**
* Converts Postman sdk request object to js-fetch request code snippet
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
        throw new Error('JS-Fetch Converter callback is not a valid function');
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

    var indent = options.indentType === 'tab' ? '\t' : ' ',
        trim = options.trimRequestBody,
        headers, body,
        codeSnippet = '',
        headerSnippet = '',
        bodySnippet = '',
        optionsSnippet = '',
        timeoutSnippet = '',
        fetchSnippet = '';
    indent = indent.repeat(options.indentCount);

    headers = request.getHeaders({enabled: true});
    headerSnippet = parseHeaders(headers);

    body = request.body.toJSON();
    bodySnippet = parseBody(body, trim);

    optionsSnippet = `var requestOptions = {\n${indent}`;
    optionsSnippet += `method: '${request.method}',\n${indent}`;
    if (headerSnippet !== '') {
        optionsSnippet += `headers: myHeaders,\n${indent}`;
        codeSnippet += headerSnippet + '\n';
    }
    if (bodySnippet !== '') {
        if (!_.includes(VALID_BODY_MODES, body.mode)) { body.mode = 'raw'; }
        optionsSnippet += `body: ${body.mode},\n${indent}`;
        codeSnippet += bodySnippet + '\n';
    }
    optionsSnippet += `redirect: '${redirectMode(options.followRedirect)}'\n};\n`;

    codeSnippet += optionsSnippet + '\n';

    fetchSnippet = `fetch('${request.url.toString()}', requestOptions)\n${indent}`;
    fetchSnippet += `.then(response => response.text())\n${indent}`;
    fetchSnippet += `.then(result => console.log(result))\n${indent}`;
    fetchSnippet += '.catch(error => console.log(\'error\', error));';

    if (options.requestTimeout > 0) {
        timeoutSnippet = `var promise = Promise.race([\n${indent}`;
        timeoutSnippet += `fetch('${request.url.toString()}', requestOptions)\n${indent}${indent}`;
        timeoutSnippet += `.then(response => response.text()),\n${indent}`;
        timeoutSnippet += `new Promise((resolve, reject) =>\n${indent}${indent}`;
        timeoutSnippet += `setTimeout(() => reject(new Error('Timeout')), ${options.requestTimeout})\n${indent}`;
        timeoutSnippet += ')\n])\n';
        timeoutSnippet += 'promise.then(result => console.log(result)),\n';
        timeoutSnippet += 'promise.catch(error => console.log(error));';
        codeSnippet += timeoutSnippet;
    }
    else {
        codeSnippet += fetchSnippet;
    }

    callback(null, codeSnippet);
}

module.exports = {
    convert: convert,
    getOptions: getOptions
};
