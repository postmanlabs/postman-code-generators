var sanitize = require('./util').sanitize,
    form = require('./util').form,
    _ = require('./lodash');

module.exports = {
    convert: function (request, options, callback) {

        if (!_.isFunction(callback)) {
            throw new Error('Curl-Converter: callback is not valid function');
        }

        var indent, trim, headersData, body, text, redirect, timeout, multiLine, format, snippet, silent;
        redirect = options.followRedirect || _.isUndefined(options.followRedirect);
        timeout = options.requestTimeout ? options.requestTimeout : 0;
        multiLine = options.multiLine || _.isUndefined(options.multiLine);
        format = options.longFormat || _.isUndefined(options.longFormat);
        trim = options.trimRequestBody ? options.trimRequestBody : false;
        silent = options.silent ? options.silent : false;

        snippet = silent ? `curl ${form('-s', format)}` : 'curl';
        if (redirect) {
            snippet += ` ${form('-L', format)}`;
        }
        if (timeout > 0) {
            snippet += ` ${form('-m', format)} ${timeout}`;
        }
        if (multiLine) {
            indent = options.indentType === 'tab' ? '\t' : ' ';
            indent = ' ' + options.lineContinuationCharacter + '\n' + indent.repeat(options.indentCount || (options.indentType === 'tab' ? 1 : 4)); // eslint-disable-line max-len
        }
        else {
            indent = ' ';
        }

        if (request.method === 'HEAD') {
            snippet += ` ${form('-I', format)} "${encodeURI(request.url.toString())}"`;
        }
        else {
            snippet += ` ${form('-X', format)} ${request.method} "${encodeURI(request.url.toString())}"`;
        }

        headersData = request.getHeaders({ enabled: true });
        _.forEach(headersData, function (value, key) {
            snippet += indent + `${form('-H', format)} "${sanitize(key, trim)}: ${sanitize(value, trim)}"`;
        });

        if (request.body) {
            body = request.body.toJSON();

            if (!_.isEmpty(body)) {
                switch (body.mode) {
                    case 'urlencoded':
                        text = [];
                        _.forEach(body.urlencoded, function (data) {
                            if (!data.disabled) {
                                text.push(`${escape(data.key)}=${escape(data.value)}`);
                            }
                        });
                        snippet += indent + `${form('-d', format)} "${text.join('&')}"`;
                        break;
                    case 'raw':
                        snippet += indent + `${form('-d', format)} "${sanitize(body.raw.toString(), trim)}"`;
                        break;
                    case 'formdata':
                        _.forEach(body.formdata, function (data) {
                            if (!(data.disabled)) {
                                if (data.type === 'file') {
                                    snippet += indent + `${form('-F', format)}`;
                                    snippet += ` "${sanitize(data.key, trim)}=@${sanitize(data.src, trim)}"`;
                                }
                                else {
                                    snippet += indent + `${form('-F', format)}`;
                                    snippet += ` "${sanitize(data.key, trim)}=${sanitize(data.value, trim)}"`;
                                }
                            }
                        });
                        break;
                    case 'file':
                        snippet += indent + `${form('--data-binary', format)}`;
                        snippet += ` "${sanitize(body.key, trim)}=@${sanitize(body.value, trim)}"`;
                        break;
                    default:
                        snippet += `${form('-d', format)} ""`;
                }
            }
        }
        callback(null, snippet);
    },
    getOptions: function () {
        return [
            {
                name: 'Multiline snippet',
                id: 'multiLine',
                type: 'boolean',
                default: true,
                description: 'Split cURL command across multiple lines'
            },
            {
                name: 'Long form options',
                id: 'longFormat',
                type: 'boolean',
                default: true,
                description: 'Use the long form for cURL options (--header instead of -H)'
            },
            {
                name: 'Line continuation character',
                id: 'lineContinuationCharacter',
                availableOptions: ['\\', '^'],
                type: 'enum',
                default: '\\',
                description: 'Character that should be used to split lines in a multiline snippet'
            },
            {
                name: 'Request timeout',
                id: 'requestTimeout',
                type: 'integer',
                default: 0,
                description: 'How long the request should wait for a response before timing out (seconds)'
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
                default: false,
                description: 'Trim request body fields'
            },
            {
                name: 'Silent',
                id: 'silent',
                type: 'boolean',
                default: false,
                description: 'Use cURL\'s silent mode in the generated snippet'
            }
        ];
    }
};
