var _ = require('../lodash'),
  sanitize = require('./sanitize').sanitize;

/**
 * Used to parse the body of the postman SDK-request and return in the desired format
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @param  {Boolean} bodyTrim - whether to trim request body fields
 * @returns {String} - request body
 */
module.exports = function (request, indentation, bodyTrim) {
  // used to check whether body is present in the request or not
  if (request.body) {
    var requestBody = '',
      bodyDataMap,
      bodyFileMap,
      enabledBodyList;

    switch (request.body.mode) {
      case 'raw':
        if (!_.isEmpty(request.body[request.body.mode])) {
          requestBody += `payload = ${sanitize(request.body[request.body.mode],
            request.body.mode, bodyTrim)}\n`;
        }
        else {
          requestBody = 'payload  = {}\n';
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
        requestBody += `payload = ${sanitize(JSON.stringify({
          query: query,
          variables: graphqlVariables
        }),
        'raw', bodyTrim)}\n`;
        return requestBody;
      case 'urlencoded':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyDataMap = _.map(enabledBodyList, function (value) {
            return `${sanitize(value.key, request.body.mode, bodyTrim)}=` +
                        `${sanitize(value.value, request.body.mode, bodyTrim)}`;
          });
          requestBody += `payload = '${bodyDataMap.join('&')}'\n`;
        }
        else {
          requestBody = 'payload = {}\n';
        }
        return requestBody;
      case 'formdata':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyDataMap = _.map(_.filter(enabledBodyList, {'type': 'text'}), function (value) {
            return (`'${sanitize(value.key, request.body.mode, bodyTrim)}': ` +
                            `'${sanitize(value.value, request.body.mode, bodyTrim)}'`);
          });
          bodyFileMap = _.map(_.filter(enabledBodyList, {'type': 'file'}), function (value) {
            return `${indentation}('${value.key}', open('${sanitize(value.src, request.body.mode, bodyTrim)}','rb'))`;
          });
          requestBody = `payload = {${bodyDataMap.join(',\n')}}\nfiles = [\n${bodyFileMap.join(',\n')}\n]\n`;
        }
        else {
          requestBody = 'payload = {}\nfiles = {}\n';
        }
        return requestBody;
      case 'file':
        // return `payload = {open('${request.body[request.body.mode].src}', 'rb').read()\n}`;
        return 'payload = "<file contents here>"\n';
      default:
        return 'payload = {}\n';
    }
  }
  return 'payload = {}\n';
}
;
