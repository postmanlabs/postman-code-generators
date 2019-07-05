var _ = require('./lodash'),
    sanitize = require('./util').sanitize;
const VALID_METHODS = ['DEFAULT',
    'DELETE',
    'GET',
    'HEAD',
    'MERGE',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
    'TRACE'];

/**
 * Parses URLEncoded body from request to powershell-restmethod syntax
 *
 * @param {Object} body URLEncoded Body
 */
function parseURLEncodedBody (body) {
    var bodySnippet = '$body = "',
        urlencodedArray = [];
    _.forEach(body, function (data) {
        if (!data.disabled) {
            urlencodedArray.push(`${escape(data.key)}=${escape(data.value)}`);
        }
    });
    bodySnippet += urlencodedArray.join('&') + '"\n';
    return bodySnippet;
}

/**
 * Parses Formdata from request to powershell-restmethod syntax
 *
 * @param {Object} body FormData body
 * @param {boolean} trim trim body option
 */
function parseFormData (body, trim) {
    var bodySnippet = '$multipartContent = [System.Net.Http.MultipartFormDataContent]::new()\n';
    _.forEach(body, function (data) {
        if (!data.disabled) {
            bodySnippet += '$stringHeader = ' +
                            '[System.Net.Http.Headers.ContentDispositionHeaderValue]::new("form-data")\n' +
                            `$stringHeader.Name = "${sanitize(data.key, trim)}"\n` +
                            `$StringContent = [System.Net.Http.StringContent]::new("${sanitize(data.value, trim)}")\n` +
                            '$StringContent.Headers.ContentDisposition = $stringHeader\n' +
                            '$multipartContent.Add($stringContent)\n\n';
        }
    });
    bodySnippet += '$body = $multipartContent\n';
    return bodySnippet;
}

/**
 * Parses Raw data from request to powershell-restmethod syntax
 *
 * @param {Object} body Raw body data
 * @param {boolean} trim trim body option
 */
function parseRawBody (body, trim) {
    return `$body = "${sanitize(body.toString(), trim)}"\n`;
}

/* istanbul ignore next */
/**
 * Parses File data from request to powershell-restmethod syntax
 *
 * @param {Object} body File body
 * @param {boolean} trim trim body option
 */
function parseFileData (body, trim) {
    var bodySnippet = '$multipartContent = [System.Net.Http.MultipartFormDataContent]::new()\n';
    _.forEach(body, function (data) {
        if (!data.disabled) {
            bodySnippet += `$multipartFile = "${data.src}"\n` +
            '$FileStream = [System.IO.FileStream]::new($multipartFile, [System.IO.FileMode]::Open)\n' +
            '$fileHeader = [System.Net.Http.Headers.ContentDispositionHeaderValue]::new("form-data")\n' +
            '$fileHeader.Name = "Form data field name"\n' +
            `$fileHeader.FileName = "${sanitize(data.key, trim)}"\n` +
            '$fileContent = [System.Net.Http.StreamContent]::new($FileStream)\n' +
            '$fileContent.Headers.ContentDisposition = $fileHeader\n' +
            '$fileContent.Headers.ContentType = ' +
            '[System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("Content-Type Header")\n' +
            '$multipartContent.Add($fileContent)\n\n';
        }
    });
    bodySnippet += '$body = $multipartContent\n';
    return bodySnippet;
}

/**
 * Parses Body from request to powershell-restmethod syntax based on the body mode
 *
 * @param {Object} body body object from request
 * @param {boolean} trim trim body option
 */
function parseBody (body, trim) {
    if (!_.isEmpty(body)) {
        switch (body.mode) {
            case 'urlencoded':
                return parseURLEncodedBody(body.urlencoded);
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
 * Parses headers from request to powershell-restmethod syntax
 *
 * @param {Object} headers headers from the request
 */
function parseHeaders (headers) {
    var headerSnippet = '';
    if (!_.isEmpty(headers)) {
        headerSnippet = '$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"\n';
        _.forEach(headers, function (value, key) {
            headerSnippet += `$headers.Add("${key}", '${value}')\n`;
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
            name: 'Request timeout',
            id: 'requestTimeout',
            type: 'integer',
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
 * Converts Postman sdk request object to powershell-restmethod code snippet
 *
 * @param {Object} request - postman-SDK request object
 * @param {Object} options
 * @param {Boolean} options.followRedirect - whether to enable followredirect
 * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not
 * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
 * @param {Function} callback - callback function with parameters (error, snippet)
 */
function convert (request, options, callback) {
    if (!_.isFunction(callback)) {
        throw new Error('Powershell RestMethod Converter callback is not a valid function');
    }

    var trim = options.trimRequestBody,
        headers, body,
        codeSnippet = '',
        headerSnippet = '',
        bodySnippet = '';

    headers = request.getHeaders({enabled: true});
    headerSnippet = parseHeaders(headers);

    body = request.body.toJSON();
    bodySnippet = parseBody(body, trim);

    if (headerSnippet !== '') {
        codeSnippet += headerSnippet + '\n';
    }
    if (bodySnippet !== '') {
        codeSnippet += bodySnippet + '\n';
    }

    if (_.includes(VALID_METHODS, request.method)) {
        codeSnippet += `$response = Invoke-RestMethod '${request.url.toString()}' -Method '` +
                        `${request.method}' -Headers $headers -Body $body`;
    }
    else {
        codeSnippet += `$response = Invoke-RestMethod '${request.url.toString()}' -CustomMethod ` +
                        `'${request.method}' -Headers $headers -Body $body`;
    }
    if (options.requestTimeout > 0) {
        // Powershell rest method accepts timeout in seconds
        let requestTimeout = options.requestTimeout;
        requestTimeout /= 1000;
        codeSnippet += ` -TimeoutSec ${requestTimeout}`;
    }
    if (!options.followRedirect) {
        codeSnippet += ' -MaximumRedirection 0';
    }
    codeSnippet += '\n$response | ConvertTo-Json';
    callback(null, codeSnippet);
}

module.exports = {
    convert: convert,
    getOptions: getOptions
};
