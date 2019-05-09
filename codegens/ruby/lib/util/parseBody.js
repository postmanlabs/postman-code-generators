var _ = require('../lodash'),
    sanitize = require('./sanitize').sanitize;

/**
 * Used to parse the body of the postman SDK-request and return in the desired format
 * 
 * @param  {Object} request - postman SDK-request object
 * @param  {Boolean} requestBodyTrim - whether to trim request body fields 
 * @returns {String} - request body
 */
module.exports = function (request, requestBodyTrim) {
    // used to check whether body is present in the request and return accordingly
    if (request.body) {
        var requestBody = '',
            bodyMap,
            enabledBodyList;

        switch (request.body.mode) {
            case 'raw':
                if (!_.isEmpty(request.body[request.body.mode])) {
                    requestBody += 'request.body = ' +
                        `${sanitize(request.body[request.body.mode], request.body.mode, requestBodyTrim)}\n`;
                }
                return requestBody;
            case 'urlencoded':
                enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
                if (!_.isEmpty(enabledBodyList)) {
                    bodyMap = _.map(enabledBodyList, function (value) {
                        return `${sanitize(value.key, request.body.mode, requestBodyTrim)}=` +
                            `${sanitize(value.value, request.body.mode, requestBodyTrim)}`;
                    });
                    requestBody = `request.body = "${sanitize(bodyMap.join('&'), 'doubleQuotes')}"\n`;
                }
                return requestBody;
            case 'formdata':
                enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
                if (!_.isEmpty(enabledBodyList)) {
                    bodyMap = _.map(enabledBodyList, function (value) {
                        if (value.type === 'text') {
                            return (`------WebKitFormBoundary7MA4YWxkTrZu0gW\\r\\nContent-Disposition: form-data; name="${sanitize(value.key, request.body.mode, requestBodyTrim)}"` + // eslint-disable-line max-len
                                `\\r\\n\\r\\n${sanitize(value.value, request.body.mode, requestBodyTrim)}\\r\\n`);
                        }
                        else if (value.type === 'file') {
                            return `"${sanitize(value.key, request.body.mode, requestBodyTrim)}"' = ` +
                            `'${sanitize(value.src, request.body.mode, requestBodyTrim)}')`;
                        }
                    });
                    requestBody = 'request["content-type"] = \'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\'\n'; // eslint-disable-line max-len
                    requestBody += `request.body = "${sanitize(bodyMap.join(''), 'doubleQuotes')}------WebKitFormBoundary7MA4YWxkTrZu0gW--"\n`; // eslint-disable-line max-len
                }
                return requestBody;
            case 'file':
                // TODO find out how and implement
                return requestBody;
            default:
                return requestBody;

        }
    }
    return '';
};
