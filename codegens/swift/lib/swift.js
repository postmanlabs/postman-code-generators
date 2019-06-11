var _ = require('./lodash'),
    sanitize = require('./util').sanitize,
    self;

/**
 * Parses Raw data from request to fetch syntax
 *
 * @param {Object} body - Raw body data
 * @param {String} mode - Request body type (i.e. raw, urlencoded, formdata, file)
 * @param {boolean} trim - trim body option
 * @returns {String} request body in the desired format
 */
function parseRawBody (body, mode, trim) {
    var bodySnippet;
    bodySnippet = `let parameters = ${sanitize(body, mode, trim)}\n`;
    bodySnippet += 'let postData = parameters.data(using: .utf8)';
    return bodySnippet;
}

/**
 * Parses URLEncoded body from request to fetch syntax
 *
 * @param {Object} body - URLEncoded Body
 * @param {String} mode - Request body type (i.e. raw, urlencoded, formdata, file)
 * @param {boolean} trim - trim body option
 * @returns {String} request body in the desired format
 */
function parseURLEncodedBody (body, mode, trim) {
    var payload, bodySnippet;
    payload = _.reduce(body, function (accumulator, data) {
        if (!data.disabled) {
            accumulator.push(`${sanitize(data.key, mode, trim)}=${sanitize(data.value, mode, trim)}`);
        }
        return accumulator;
    }, []).join('&');

    bodySnippet = `let parameters = "${payload}"\n`;
    bodySnippet += 'let postData =  parameters.data(using: .utf8)';
    return bodySnippet;
}

/**
 * Parses formData body from request to fetch syntax
 *
 * @param {Object} body - formData Body
 * @param {String} mode - Request body type (i.e. raw, urlencoded, formdata, file)
 * @param {boolean} trim - trim body option
 * @param {String} indent - indentation string
 * @returns {String} request body in the desired format
 */
function parseFormData (body, mode, trim, indent) {
    var parameters = sanitize(JSON.stringify(body, null, 4), mode, trim),
        bodySnippet = `let parameters = ${parameters} as [[String : Any]]\n\n`;
    bodySnippet += 'let boundary = "Boundary-\\(UUID().uuidString)"\n';
    bodySnippet += 'var body = ""\nvar error: Error? = nil\n';
    bodySnippet += 'for param in parameters {\n';
    bodySnippet += `${indent}if param["disabled"] == nil {\n`;
    bodySnippet += `${indent.repeat(2)}let paramName = param["key"]!\n`;
    bodySnippet += `${indent.repeat(2)}body += "--\\(boundary)\\r\\n"\n`;
    // eslint-disable-next-line no-useless-escape
    bodySnippet += `${indent.repeat(2)}body += "Content-Disposition:form-data; name=\\"\\(paramName)\\"\"\n`;
    bodySnippet += `${indent.repeat(2)}if let paramValue = param["value"] {\n`;
    bodySnippet += `${indent.repeat(3)}body += "\\r\\n\\r\\n\\(paramValue)\\r\\n"\n`;
    bodySnippet += `${indent.repeat(2)}} else {\n`;
    bodySnippet += `${indent.repeat(3)}body += "; filename=\\"{Insert_File_Name}\\"\\r\\n"\n`;
    bodySnippet += `${indent.repeat(3)}  + "Content-Type: \\"{Insert_File_Content_Type}\\"\\r\\n\\r\\n`;
    bodySnippet += '{Insert_File_Content}\\r\\n"\n';
    bodySnippet += `${indent.repeat(2)}}\n${indent}}\n}\nbody += "--\\(boundary)--\\r\\n";\n`;
    bodySnippet += 'let postData = body.data(using: .utf8)';
    return bodySnippet;
}

/* istanbul ignore next */
/**
 * Parses file body from the Request
 *
 * @param {String} indent - indentation string
 * @returns {String} request body in the desired format
 */
function parseFile (indent) {
    var bodySnippet = 'let filename = "{Insert_File_Name}", postData = Data()\n';
    bodySnippet += 'if let path = Bundle.main.path(forResource: filename, ofType: nil) {\n';
    bodySnippet += `${indent}do {\n${indent.repeat(2)}postData = try NSData(contentsOfFile:path, options:[]) as Data\n`;
    bodySnippet += `${indent}} catch {\n`;
    bodySnippet += `${indent.repeat(2)}print("Failed to read from \\(String(describing: filename))")\n`;
    bodySnippet += `${indent}}\n} else {\n`;
    bodySnippet += `${indent}print("Failed to load file from app bundle \\(String(describing: filename))")\n}\n`;
    return bodySnippet;
}

/**
 * Parses Body from the Request using
 *
 * @param {Object} body - body object from request.
 * @param {boolean} trim - trim body option
 * @param {String} indent - indentation string
 * @returns {String} utility function for getting request body in the desired format
 */
function parseBody (body, trim, indent) {
    if (!_.isEmpty(body) && !_.isEmpty(body[body.mode])) {
        switch (body.mode) {
            case 'urlencoded':
                return parseURLEncodedBody(body.urlencoded, body.mode, trim);
            case 'raw':
                return parseRawBody(body.raw, body.mode, trim);
            case 'formdata':
                return parseFormData(body.formdata, body.mode, trim, indent);
            /* istanbul ignore next */
            case 'file':
                return parseFile(indent);
            default:
                return '';
        }
    }
    return '';
}

/**
 * Parses headers from the request.
 *
 * @param {Object} headers - headers from the request.
 * @param {String} mode - Request body type (i.e. raw, urlencoded, formdata, file)
 * @returns {String} request headers in the desired format
 */
function parseHeaders (headers, mode) {
    var headerSnippet = '';
    if (!_.isEmpty(headers)) {
        _.forEach(headers, function (value, key) {
            headerSnippet += `request.addValue("${sanitize(value, 'header')}", `;
            headerSnippet += `forHTTPHeaderField: "${sanitize(key, 'header')}")\n`;
        });
    }
    if (mode === 'formdata') {
        headerSnippet += 'request.addValue("multipart/form-data; ';
        headerSnippet += 'boundary=\\(boundary)", forHTTPHeaderField: "Content-Type")\n';
    }
    /* istanbul ignore next */
    else if (mode === 'file') {
        headerSnippet += 'request.addValue("{Insert_File_Content_Type}", forHTTPHeaderField: "Content-Type")\n';
    }
    return headerSnippet;
}

self = module.exports = {
    /**
     * Used in order to get additional options for generation of Swift code snippet
     *
     * @module getOptions
     *
     * @returns {Array} Additional options specific to generation of Swift-URLSession code snippet
     */
    getOptions: function () {
        return [
            {
                name: 'Indent Count',
                id: 'indentCount',
                type: 'integer',
                default: 1,
                description: 'Integer denoting count of indentation required'
            },
            {
                name: 'Indent type',
                id: 'indentType',
                type: 'enum',
                availableOptions: ['tab', 'space'],
                default: 'tab',
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
                name: 'Body trim',
                id: 'trimRequestBody',
                type: 'boolean',
                default: true,
                description: 'Boolean denoting whether to trim request body fields'
            },
            {
                name: 'Follow redirect',
                id: 'followRedirect',
                type: 'boolean',
                default: true,
                description: 'Boolean denoting whether or not to automatically follow redirects'
            }
        ];
    },

    /**
     * Converts Postman sdk request object to Swift-URLSession code snippet
     *
     * @module convert
     *
     * @param  {Object} request - Postman SDK-request object
     * @param  {Object} options - Options to tweak code snippet generated in Swift
     * @param  {String} options.indentType - type of indentation eg: space / tab (default: space)
     * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: space,
                                                                     default: 1 for indentType: tab)
     * @param {Number} options.requestTimeout - time in milli-seconds after which request will bail out
                                                 (default: 0 -> never bail out)
     * @param {Boolean} options.trimRequestBody - whether to trim request body fields (default: false)
     * @param {Boolean} options.followRedirect - whether to allow redirects of a request
     * @param  {Function} callback - Callback function with parameters (error, snippet)
     * @returns {String} Generated swift snippet via callback
     */
    convert: function (request, options, callback) {

        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }
        else if (!_.isFunction(callback)) {
            throw new Error('Swift-Converter: callback is not valid function');
        }
        self.getOptions().forEach((option) => {
            if (_.isUndefined(options[option.id])) {
                options[option.id] = option.default;
            }
        });
        var codeSnippet, indent, trim, timeout, finalUrl, // followRedirect,
            bodySnippet = '',
            headerSnippet = '',
            requestBody = (request.body ? request.body.toJSON() : {});

        indent = options.indentType === 'tab' ? '\t' : ' ';
        indent = indent.repeat(options.indentCount);
        timeout = options.requestTimeout;
        // followRedirect = options.followRedirect;
        trim = options.trimRequestBody;
        finalUrl = encodeURI(request.url.toString());

        bodySnippet = parseBody(requestBody, trim, indent);

        codeSnippet = 'import Foundation\n\n';
        codeSnippet += 'var semaphore = DispatchSemaphore (value: 0)\n\n';
        if (bodySnippet !== '') {
            codeSnippet += `${bodySnippet}\n\n`;
        }
        codeSnippet += `var request = URLRequest(url: URL(string: "${finalUrl}")!, timeoutInterval: ${timeout})\n`;
        headerSnippet = parseHeaders(request.getHeaders({ enabled: true }), (request.body ? request.body.mode : 'raw'));
        if (headerSnippet !== '') {
            codeSnippet += headerSnippet + '\n';
        }
        codeSnippet += `request.httpMethod = "${request.method}"\n`;
        if (bodySnippet !== '') {
            codeSnippet += 'request.httpBody = postData\n';
        }
        codeSnippet += '\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in \n';
        codeSnippet += `${indent}guard let data = data else {\n`;
        codeSnippet += `${indent.repeat(2)}print(String(describing: error))\n`;
        codeSnippet += `${indent.repeat(2)}return\n`;
        codeSnippet += `${indent}}\n`;
        codeSnippet += `${indent}print(String(data: data, encoding: .utf8)!)\n`;
        codeSnippet += `${indent}semaphore.signal()\n}\n\n`;
        codeSnippet += 'task.resume()\n';
        codeSnippet += 'semaphore.wait()\n';

        return callback(null, codeSnippet);
    }
};
