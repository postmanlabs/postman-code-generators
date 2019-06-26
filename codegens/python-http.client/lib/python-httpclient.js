var _ = require('./lodash'),
    sanitize = require('./util/sanitize').sanitize,
    parseBody = require('./util/parseBody');

/**
 * Used to parse the request headers
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getheaders (request, indentation) {
    var headerObject = request.getHeaders({enabled: true}),
        requestBodyMode = (request.body ? request.body.mode : 'raw'),
        headerMap;

    if (!_.isEmpty(headerObject)) {
        headerMap = _.map(Object.keys(headerObject), function (key) {
            return `${indentation}'${sanitize(key, 'header')}': ` +
            `'${sanitize(headerObject[key], 'header')}'`;
        });
        if (requestBodyMode === 'formdata') {
            headerMap.push(`${indent}'Content-type': 'multipart/form-data; boundary={}'.format(boundary)`);
        }
        return `headers = {\n${headerMap.join(',\n')}\n}\n`;
    }
    if (requestBodyMode === 'formdata') {
        return `headers = {\n${indentation} 'Content-type': ` +
             '\'multipart/form-data; boundary={}\'.format(boundary) \n}\n';
    }
    return 'headers = {}\n';
}

/**
 * Generates URL's path with query string
 *
 * @param {Object} requestUrl - Postman Sdk Request's Url object
 * @returns {String} - Url path with query (no host)
 */
function getUrlPathWithQuery (requestUrl) {
    var path = requestUrl.getPath(),
        query = requestUrl.getQueryString({ ignoreDisabled: true }),
        urlPathWithQuery = '';

    urlPathWithQuery += (path === '/' ? '' : path);
    if (query !== '') {
        urlPathWithQuery += '?' + sanitize(query);
    }
    return urlPathWithQuery;
}

module.exports = {
    /**
     * Used to return options which are specific to a particular plugin
     *
     * @module getOptions
     *
     * @returns {Array}
     */
    getOptions: function () {
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
                default: 'tab',
                availableOptions: ['tab', 'space'],
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
    * Used to convert the postman sdk-request object in python-httpclient reuqest snippet
    *
    * @module convert
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options - Options to tweak code snippet generated in Python
    * @param  {String} options.indentType - type of indentation eg: space / tab (default: space)
    * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: space,
                                                                    default: 1 for indentType: tab)
    * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.requestBodyTrim : whether to trim request body fields (default: false)
    * @param {Boolean} options.followRedirect : whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    */
    convert: function (request, options, callback) {
        var snippet = '',
            indentation = '',
            identity = '';

        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }
        else if (!_.isFunction(callback)) {
            throw new Error('Python-Http.Client~convert: Callback is not a function');
        }

        identity = options.indentType === 'tab' ? '\t' : ' ';
        indentation = identity.repeat(options.indentCount || (options.indentType === 'tab' ? 1 : 4));

        snippet += 'import http.client\n';
        snippet += `conn = http.client.HTTPSConnection("${request.url.host.join('.')}"`;
        snippet += options.requestTimeout !== 0 ? `, timeout = ${options.requestTimeout})\n` : ')\n';
        snippet += parseBody(request.toJSON(), indentation, options.requestBodyTrim);
        snippet += getheaders(request, indentation);
        snippet += `conn.request("${request.method}", "${getUrlPathWithQuery(request.url)}", payload, headers)\n`;
        snippet += 'res = conn.getresponse()\n';
        snippet += 'data = res.read()\n';
        snippet += 'print(data.decode("utf-8"))';
        snippet += options.followRedirect ? '' : '# Cant handle redirects. Redirects always true\n';

        return callback(null, snippet);
    }
};
