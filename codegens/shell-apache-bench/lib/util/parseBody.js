var _ = require('../lodash'),
  sanitize = require('./sanitize').sanitize;

/**
 * Used to parse the body of the postman SDK-request and return in the desired format
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {Boolean} trimRequestBody - whether to trim request body fields
 * @returns {String} - request body
 */
module.exports = function (request, trimRequestBody) {
  // used to check whether body is present in the request and return accordingly
  if (request.body) {
    var requestBody = '',
      bodyMap = [],
      enabledBodyList;

    switch (request.body.mode) {
      case 'raw':
        if (!_.isEmpty(request.body[request.body.mode])) {
          requestBody += `'${sanitize(request.body[request.body.mode], request.body.mode, trimRequestBody)}' \\\n`;
        }
        return requestBody;
      // eslint-disable-next-line no-case-declarations
      case 'graphql':
        let query = request.body[request.body.mode].query,
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(request.body[request.body.mode].variables);
        }
        catch (e) {
          graphqlVariables = {};
        }
        requestBody += `'${sanitize(JSON.stringify({
          query: query,
          variables: graphqlVariables
        }), 'raw', trimRequestBody)}' \\\n`;
        return requestBody;
      case 'urlencoded':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyMap = _.map(enabledBodyList, function (value) {
            return `${sanitize(value.key, request.body.mode, trimRequestBody)}=` +
                            `${sanitize(value.value, request.body.mode, trimRequestBody)}`;
          });
          requestBody = `'${bodyMap.join('&')}' \\\n`;
        }
        return requestBody;
      case 'formdata':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          _.forEach(enabledBodyList, function (value) {
            if (value.type === 'text') {
              bodyMap.push(`${sanitize(value.key, request.body.mode, trimRequestBody)}=` +
                            `${sanitize(value.value, request.body.mode, trimRequestBody)}`);
            }
          });
          requestBody = `'${bodyMap.join('&')}' \\\n`;
        }
        return requestBody;
        /* istanbul ignore next */
      case 'file':
        requestBody += `${sanitize(request.body[request.body.mode].src,
          request.body.mode, trimRequestBody)}' \\\n`;
        return requestBody;
      default:
        return requestBody;

    }
  }
  return '';
};
