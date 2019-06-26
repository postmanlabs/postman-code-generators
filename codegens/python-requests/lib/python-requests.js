var _ = require('./lodash'),
    parseBody = require('./util/parseBody'),
    sanitize = require('./util/sanitize').sanitize;

/**
 * Used to parse the request headers
 * 
 * @param  {Object} request - postman SDK-request object 
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getheaders (request, indentation) {
    var headerObject = request.getHeaders({enabled: true}),
        headerMap;

    if (!_.isEmpty(headerObject)) {
        headerMap = _.map(Object.keys(headerObject), function (key) {
            return `${indentation}'${sanitize(key, 'header')}': ` +
            `'${sanitize(headerObject[key], 'header')}'`;
        });
        return `headers ={\n${headerMap.join(',\n')}}\n`;
    }
    return 'headers= {}\n';
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
        }];
    },

    /**
    * Used to convert the postman sdk-request object to python request snippet 
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
            identity = '';

        if (_.isFunction(options)) {
            callback = options;
            options = null;
        }
        else if (!_.isFunction(callback)) {
            throw new Error('Python-Requests~convert: Callback is not a function');
        }

        identity = options.indentType === 'tab' ? '\t' : ' ';
        indentation = identity.repeat(options.indentCount || (options.indentType === 'tab' ? 1 : 4));
        snippet += 'import requests\n\n';
        snippet += `url = "${sanitize(request.url.toString(), 'url')}"\n\n`;
        snippet += `${parseBody(request.toJSON(), indentation, options.trimRequestBody)}`;
        snippet += `${getheaders(request, indentation)}\n`;
        snippet += `response = requests.request("${request.method}", url, headers=headers`;

        snippet += request.body && request.body.mode && request.body.mode === 'formdata' ?
            ', data = payload, files = files' : ', data = payload';
        snippet += !options.followRedirect ? ', allow_redirects=False' : '';
        snippet += options.requestTimeout !== 0 ? `, timeout=${options.requestTimeout}` : '';
        snippet += options.followRedirect ? '' : ', allow_redirects=false';
        snippet += ')\n\n';
        snippet += 'print(response.text.encode(\'utf8\'))\n';

        callback(null, snippet);
    }
};
