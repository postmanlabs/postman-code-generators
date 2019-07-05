var _ = require('./lodash'),
    parseBody = require('./util/parseBody'),
    sanitize = require('./util/sanitize').sanitize,
    sanitizeOptions = require('./util/sanitize').sanitizeOptions,
    self,
    defaultOptions = {};

/**
 * Used to get the headers and put them in the desired form of the language
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */
function getHeaders (request, indentation) {
    var headerObject = request.getHeaders({enabled: true}),
        headerMap;

    if (!_.isEmpty(headerObject)) {
        headerMap = _.map(Object.keys(headerObject), function (key) {
            return `${indentation}'${sanitize(key)}' => ` +
            `'${sanitize(headerObject[key])}'`;
        });
        return `$request->setHeaders(array(\n${headerMap.join(',\n')}\n));`;
    }
    return '';
}


self = module.exports = {
    /**
     * @returns {Array} plugin specific options
     */
    getOptions: function () {
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
                default: 'space',
                availableOptions: ['tab', 'space'],
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
     * @param  {Object} request - postman SDK-request object
     * @param  {Object} options
     * @param  {String} options.indentType - type of indentation eg: spaces/tab (default: space)
     * @param  {String} options.indentCount - frequency of indent (default: 4 for indentType: space,
     *                                                               default: 2 for indentType: tab)
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
        }
        else if (!_.isFunction(callback)) {
            throw new Error('Php-Pecl(HTTP)~convert: Callback is not a function');
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

        identity = options.indentType === 'tab' ? '\t' : ' ';
        indentation = identity.repeat(options.indentCount);

        snippet = '<?php\n';
        snippet += '$client = new http\\Client;\n';
        snippet += '$request = new http\\Client\\Request;\n';
        snippet += `$request->setRequestUrl('${sanitize(request.url.toString())}');\n`;
        snippet += `$request->setRequestMethod('${request.method}');\n`;
        if (!_.isEmpty(request.body)) {
            snippet += '$body = new http\\Message\\Body;\n';
            snippet += `${parseBody(request.toJSON(), indentation, options.trimRequestBody)}`;
            snippet += '$request->setBody($body);\n';
        }
        snippet += '$request->setOptions(array(';
        snippet += options.requestTimeout === 0 ? '' : `'connecttimeout' => ${options.requestTimeout}`;
        snippet += options.followRedirect ? '' : ', \'redirect\' => false';
        snippet += '));\n';
        snippet += `${getHeaders(request, indentation)}\n`;
        snippet += '$client->enqueue($request)->send();\n';
        snippet += '$response = $client->getResponse();\n';
        snippet += 'echo $response->getBody();\n';
        snippet += '?>';

        return callback(null, snippet);
    }
};
