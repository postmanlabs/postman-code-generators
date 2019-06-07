var _ = require('../lodash'),
    sanitize = require('./sanitize').sanitize;

    /**
     * Used to parse the body of the postman SDK-request and return in the desired format
     *
     * @param  {Object} request - postman SDK-request object
     * @param  {Boolean} trimRequestBody - whether to trim request body fields
     * @param  {String} indentation - used for indenting snippet's structure
     * @returns {String} - request body
     */
module.exports = function (request, trimRequestBody, indentation) {
    // used to check whether body is present in the request and return accordingly
    if (request.body) {
        var requestBody = '',
            bodyMap,
            enabledBodyList;

        switch (request.body.mode) {
            case 'raw':
                if (!_.isEmpty(request.body[request.body.mode])) {
                    requestBody += `${indentation}"data": ` +
                        `${sanitize(request.body[request.body.mode], request.body.mode, trimRequestBody)},\n`;
                }
                return requestBody;
            case 'urlencoded':
                enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
                if (!_.isEmpty(enabledBodyList)) {
                    bodyMap = _.map(enabledBodyList, function (value) {
                        return `${indentation.repeat(2)}"${sanitize(value.key, request.body.mode, trimRequestBody)}":` +
                            ` "${sanitize(value.value, request.body.mode, trimRequestBody)}"`;
                    });
                    requestBody = `${indentation}"data": {\n${bodyMap.join(',\n')}\n${indentation}}\n`;
                }
                return requestBody;
            case 'formdata':
                requestBody = `${indentation}"processData": false,\n` +
                        `${indentation}"mimeType": "multipart/form-data",\n` +
                        `${indentation}"contentType": false,\n` +
                        `${indentation}"data": form\n`;
                return requestBody;
            default:
                return requestBody;

        }
    }
    return '';
};
