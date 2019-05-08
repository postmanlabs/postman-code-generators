var _ = require('./lodash'),
    parseBody = require('./util/parseBody'),
    sanitize = require('./util/sanitize').sanitize;

/**
     * Used to parse the request headers
     *
     * @param  {Object} request - postman SDK-request object
     * @param  {String} indent - used for indenting snippet's structure
     * @returns {String} - request headers in the desired format
     */
function getHeaders (request, indent) {
    var header = request.getHeaders({enabled: true}),
        headerMap;

    if (!_.isEmpty(header)) {
        headerMap = _.map(Object.keys(header), function (key) {
            return `${indent.repeat(2)}"${sanitize(key, 'header')}": ` +
          `"${sanitize(header[key], 'header')}"`;
        });
        return `${indent}"headers": {\n${headerMap.join(',\n')}\n${indent}},\n`;
    }
    return '';
}

/**
     * Used to get the form-data
     *
     * @param  {Object} request - postman SDK-request object
     * @param  {String} requestBodyTrim - whether to trim request body fields
     * @returns {String} - form-data in the desired format
     */
function createForm (request, requestBodyTrim) {
    var form = '',
        enabledFormList,
        formMap;

    form += 'var form = new FormData();\n';
    enabledFormList = _.reject(request.body[request.body.mode], 'disabled');
    if (!_.isEmpty(enabledFormList)) {
        formMap = _.map(enabledFormList, function (value) {
            return (`form.append("${sanitize(value.key, request.body.mode, requestBodyTrim)}", "` +
                    `${sanitize(value.value || value.src, request.body.mode, requestBodyTrim)}");`);
        });
        form += `${formMap.join('\n')}\n\n`;
    }
    return form;
}

module.exports = {
    /**
     * Used to return options which are specific to a particular plugin
     *
     * @returns {Array}
     */
    getOptions: function () {
        return [];
    },

    /**
    * Used to convert the postman sdk-request object in php-curl request snippet
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options
    * @param  {String} options.indentType - type of indentation eg: space / tab (default: space)
    * @param  {Number} options.indentCount - frequency of indent (default: 4 for indentType: space,
                                                                    default: 1 for indentType: tab)
    * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param {Boolean} options.requestBodyTrim : whether to trim request body fields (default: false)
    * @param  {Function} callback - function with parameters (error, snippet)
    */
    convert: function (request, options, callback) {
        var jQueryCode = '',
            indentType = '',
            indent = '';

        if (_.isFunction(options)) {
            callback = options;
            options = null;
        }
        else if (!_.isFunction(callback)) {
            throw new Error('js-jQuery~convert: Callback is not a function');
        }

        indentType = (options.indentType === 'tab') ? '\t' : ' ';

        indent = indentType.repeat(options.indentCount || (options.indentType === 'tab' ? 1 : 4));
        options.requestTimeout = options.requestTimeout || 0;

        if (request.body && request.body.mode === 'formdata') {
            jQueryCode = createForm(request.toJSON(), options.requestBodyTrim);
        }
        jQueryCode += 'var settings = {\n';
        jQueryCode += `${indent}"url": "${sanitize(request.url.toString(), 'url')}",\n`;
        jQueryCode += `${indent}"method": "${request.method}",\n`;
        jQueryCode += `${indent}"timeout": ${options.requestTimeout},\n`;
        jQueryCode += `${getHeaders(request, indent)}`;
        jQueryCode += `${parseBody(request.toJSON(), options.requestBodyTrim, indent)}};\n\n`;
        jQueryCode += `$.ajax(settings).done(function (response) {\n${indent}console.log(response);\n});`;

        return callback(null, jQueryCode);
    }
};
