var _ = require('./lodash'),
    parseBody = require('./util/parseBody'),
    sanitize = require('./util/sanitize').sanitize;

/**
 * Used to parse the request headers
 *
 * @param  {Object} headers - postman SDK-request object
 * @returns {String} - request headers in the desired format
 */
function parseHeaders (headers) {
    var headerSnippet = '';
    if (!_.isEmpty(headers)) {
        _.forEach(headers, function (value, key) {
            headerSnippet += `request["${key}"] = "${sanitize(value, 'header')}"\n`;
        });
    }
    return headerSnippet;
}

module.exports = {
    /**
     * Used to return options which are specific to a particular plugin
     *
     * @returns {Array}
     */
    getOptions: function () {
        return [{
            name: 'Indent Count',
            id: 'indentCount',
            type: 'integer',
            default: 0,
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

    /**
    * Used to convert the postman sdk-request object in ruby request snippet
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options
    * @param  {String} options.indentType - type of indentation eg: space / tab (default: space)
    * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: space,
                                                                    default: 1 for indentType: tab)
    * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.trimRequestBody : whether to trim request body fields (default: false)
    * @param {Boolean} options.followRedirect : whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    */
    convert: function (request, options, callback) {
        var snippet = '',
            indentation = '',
            identity = '',
            headerSnippet = '',
            methods = ['GET', 'POST', 'HEAD', 'DELETE', 'PATCH', 'PROPFIND',
                'PROPPATCH', 'PUT', 'OPTIONS', 'COPY', 'LOCK', 'UNLOCK', 'MOVE', 'TRACE'];

        if (_.isFunction(options)) {
            callback = options;
            options = null;
        }
        else if (!_.isFunction(callback)) {
            throw new Error('Ruby~convert: Callback is not a function');
        }

        identity = options.indentType === 'tab' ? '\t' : ' ';
        indentation = identity.repeat(options.indentCount || (options.indentType === 'tab' ? 1 : 4));
        // concatenation and making up the final string
        snippet = 'require "uri"\n';
        snippet += 'require "net/http"\n\n';
        if (!_.includes(methods, request.method)) {
            snippet += `class Net::HTTP::${_.capitalize(request.method)} < Net::HTTPRequest\n`;
            snippet += `${indentation}METHOD = "${request.method}"\n`;
            snippet += `${indentation}REQUEST_HAS_BODY = ${!_.isEmpty(request.body)}\n`;
            snippet += `${indentation}RESPONSE_HAS_BODY = true\n`;
            snippet += 'end\n\n';
        }
        snippet += `url = URI("${sanitize(request.url.toString(), 'url')}")\n\n`;
        if (sanitize(request.url.toString(), 'url').startsWith('https')) {
            snippet += 'https = Net::HTTP.new(url.host, url.port)\n';
            snippet += 'https.use_ssl = true\n\n';
            snippet += `request = Net::HTTP::${_.capitalize(request.method)}.new(url)\n`;
            headerSnippet = parseHeaders(request.getHeaders({enabled: true}));
            if (headerSnippet !== '') {
                snippet += headerSnippet;
            }

            snippet += `${parseBody(request.toJSON(), options.trimRequestBody)}\n`;
            snippet += 'response = https.request(request)\n';
            snippet += 'puts response.read_body\n';
        }
        else {
            snippet += 'http = Net::HTTP.new(url.host, url.port)\n\n';
            snippet += `request = Net::HTTP::${_.capitalize(request.method)}.new(url)\n`;
            headerSnippet = parseHeaders(request.getHeaders({enabled: true}));

            if (headerSnippet !== '') {
                snippet += headerSnippet;
            }
            snippet += `${parseBody(request.toJSON(), options.trimRequestBody)}\n`;
            snippet += 'response = http.request(request)\n';
            snippet += 'puts response.read_body\n';
        }

        return callback(null, snippet);
    }
};
