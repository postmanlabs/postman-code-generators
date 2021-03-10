var _ = require('../lodash'),
  sanitize = require('./sanitize').sanitize;

/**
 * Used to parse the body of the postman SDK-request and return in the desired format
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {Boolean} trimRequestBody - whether to trim request body fields
 * @param  {string} contentType - the content type of request body
 * @returns {String} - request body
 */
module.exports = function (request, trimRequestBody, contentType) {
  // used to check whether body is present in the request and return accordingly
  if (request.body) {
    var requestBody = '',
      bodyMap = [],
      enabledBodyList;

    switch (request.body.mode) {
      case 'raw':
        if (_.isEmpty(request.body[request.body.mode])) {
          return '';
        }

        // Match any application type whose underlying structure is json
        // For example application/vnd.api+json
        // All of them have +json as suffix
        if (contentType && (contentType === 'application/json' || contentType.match(/\+json$/))) {
          try {
            let jsonBody = JSON.parse(request.body[request.body.mode]);
            return `request.body = JSON.dump(${JSON.stringify(jsonBody, null, 4)})\n`;
          }
          catch (error) {
            // Do nothing
          }
        }

        requestBody += 'request.body = ' +
          `${sanitize(request.body[request.body.mode], request.body.mode, trimRequestBody)}\n`;
        return requestBody;
      case 'graphql':
        // eslint-disable-next-line no-case-declarations
        let query = request.body[request.body.mode].query,
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(request.body[request.body.mode].variables);
        }
        catch (e) {
          graphqlVariables = {};
        }
        requestBody += 'request.body = ' +
        `${sanitize(JSON.stringify({
          query: query,
          variables: graphqlVariables
        }), 'raw', trimRequestBody)}\n`;
        return requestBody;
      case 'urlencoded':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyMap = _.map(enabledBodyList, function (value) {
            return `${sanitize(value.key, request.body.mode, trimRequestBody)}=` +
                            `${sanitize(value.value, request.body.mode, trimRequestBody)}`;
          });
          requestBody = `request.body = "${sanitize(bodyMap.join('&'), 'doubleQuotes')}"\n`;
        }
        return requestBody;
      case 'formdata':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyMap = _.map(enabledBodyList, function (data) {
            if (data.type === 'text') {
              return `['${sanitize(data.key, 'formdata', trimRequestBody)}',` +
              ` '${sanitize(data.value, 'formdata', trimRequestBody)}']`;
            }
            return `['${sanitize(data.key, 'formdata', trimRequestBody)}', File.open('${data.src}')]`;
          });
        }
        requestBody = `form_data = [${bodyMap.join(',')}]\n`;
        requestBody += 'request.set_form form_data, \'multipart/form-data\'';
        return requestBody;
      case 'file':
        requestBody = 'request.body = "<file contents here>"\n';
        return requestBody;
      default:
        return requestBody;

    }
  }
  return '';
};
