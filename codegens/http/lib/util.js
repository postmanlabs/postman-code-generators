let _ = require('./lodash');

const FORM_DATA_BOUNDARY = '----WebKitFormBoundary7MA4YWxkTrZu0gW',
  RAW = 'raw',
  URL_ENCODED = 'urlencoded',
  FORM_DATA = 'formdata',
  FILE = 'file';


/**
 * Returns an array of properties in the property list.
 * 
 * @param {Object} propertyList - Postman SDK property list
 * @param {Boolean} includeDisabled - Determines whether disabled properties are to be returned
 * @returns {Object} List of members 
 */
function getMembersOfPropertyList (propertyList, includeDisabled = false) {
  /* istanbul ignore else */
  if (!includeDisabled) {
    return _.reject(propertyList.members, 'disabled');
  }

  return propertyList.members;
}

/**
 * Stringifies the members of the property list.
 * 
 * @param {Object} propertyList propertyList
 * @param {String} joinUsing specify string that should be used to join the list of properties
 * @param {Boolean} includeDisabled indicated whether or not to include disabled properties
 * @param {Boolean} trimRequestBody indicates whether or not to trin request body
 * @returns {String} Stringified property List
 */
function convertPropertyListToString (propertyList, joinUsing, includeDisabled = false, trimRequestBody = false) {
  let properties;

  properties = getMembersOfPropertyList(propertyList, includeDisabled);

  return _.join(_.map(properties, (prop) => {
    return (trimRequestBody ? prop.toString().trim() : prop.toString());
  }), joinUsing);
}

/**
 * Returns the request end-point as a string.
 * 
 * @param {Object} request - Postman SDK request
 * @returns {string} returns endpoint from the url path
 */
function getEndPoint (request) {
  let endPoint = '/',
    params = '';

  if (request.url.query.members && _.size(request.url.query.members)) {
    params += `?${convertPropertyListToString(request.url.query, '&')}`;
  }

  if (request.url.path && _.size(request.url.path)) {
    endPoint = `/${_.join(request.url.path, '/')}${params}`;
  }

  return endPoint;
}

/**
 * Returns the request host as a string.
 * 
 * @param {Object} request - Postman SDK request
 * @returns {String} host
 */
function getHost (request) {
  if (!request.url.host) {
    return '';
  }

  let host = _.join(request.url.host, '.');
  if (request.url.port) {
    host += `:${request.url.port}`;
  }

  return host;
}

/**
 * Returns the request headers as a string
 * 
 * @param {Object} request - Postman SDK request 
 * @returns {Function} calls convertPropertyListToString
 */
function getHeaders (request) {
  let contentTypeIndex = _.findIndex(request.headers.members, { key: 'Content-Type' }),
    formDataHeader = `multipart/form-data; boundary=${FORM_DATA_BOUNDARY}`,
    headers = '';

  if (contentTypeIndex >= 0) {
    if (request.headers.members[contentTypeIndex].value === 'multipart/form-data' || request.body.mode === 'formdata') {
      request.headers.members[contentTypeIndex].value = formDataHeader;
    }
  }

  headers = convertPropertyListToString(request.headers, '\n', false);
  if (request.body.mode === 'formdata' && contentTypeIndex < 0) {
    headers += `Content-Type: ${formDataHeader}`;
  }
  return headers;
}

/**
 * Returns the request body as a string
 * 
 * @param {Object} request - Postman SDK request 
 * @param {Boolean} trimRequestBody - Determines whether to trim the body
 * @returns {String} returns Body of the request
 */
function getBody (request, trimRequestBody) {
  let requestBody = '';
  /* istanbul ignore else */
  if (request.body) {
    switch (request.body.mode) {
      case RAW:
        if (!_.isEmpty(request.body[request.body.mode])) {
          requestBody += request.body[request.body.mode].toString();
        }
        return trimRequestBody ? requestBody.trim() : requestBody;

      case URL_ENCODED:
        /* istanbul ignore else */
        if (!_.isEmpty(request.body[request.body.mode])) {
          requestBody += convertPropertyListToString(request.body[request.body.mode], '&', false, trimRequestBody);
        }
        return trimRequestBody ? requestBody.trim() : requestBody;

      case FORM_DATA:
        requestBody += `${FORM_DATA_BOUNDARY}\n`;
        /* istanbul ignore else */
        if (!_.isEmpty(request.body[request.body.mode])) {
          let properties = getMembersOfPropertyList(request.body[request.body.mode]);
          _.forEach(properties, function (property) {
            /* istanbul ignore else */
            if (property.type === 'text') {
              requestBody += 'Content-Disposition: form-data; name="';
              requestBody += `${(trimRequestBody ? property.key.trim() : property.key)}"\n`;
              requestBody += `\n${(trimRequestBody ? property.value.trim() : property.value)}\n`;
            }
            else if (property.type === 'file') {
              requestBody += 'Content-Disposition: form-data; name="';
              requestBody += `${(trimRequestBody ? property.key.trim() : property.key)}"; filename="<FILE_NAME >"`;
              requestBody += `\n${(trimRequestBody ? property.value.trim() : property.value)}\n`;
            }
            requestBody += `${FORM_DATA_BOUNDARY}\n`;
          });
        }
        return trimRequestBody ? requestBody.trim() : requestBody;

      case FILE:
        return JSON.stringify(request.body[request.body.mode]);
      default:
        return requestBody;
    }
  }
  return '';
}

/**
 * sanitizes input options
 *
 * @param {Object} options - Options provided by the user
 * @param {Array} optionsArray - options array received from getOptions function
 *
 * @returns {Object} - Sanitized options object
 */
function sanitizeOptions (options, optionsArray) {
  var result = {},
    defaultOptions = {},
    id;
  optionsArray.forEach((option) => {
    defaultOptions[option.id] = {
      default: option.default,
      type: option.type
    };
    if (option.type === 'enum') {
      defaultOptions[option.id].availableOptions = option.availableOptions;
    }
  });

  for (id in options) {
    if (options.hasOwnProperty(id)) {
      if (defaultOptions[id] === undefined) {
        continue;
      }
      switch (defaultOptions[id].type) {
        case 'boolean':
          if (typeof options[id] !== 'boolean') {
            result[id] = defaultOptions[id].default;
          }
          else {
            result[id] = options[id];
          }
          break;
        case 'positiveInteger':
          if (typeof options[id] !== 'number' || options[id] < 0) {
            result[id] = defaultOptions[id].default;
          }
          else {
            result[id] = options[id];
          }
          break;
        case 'enum':
          if (!defaultOptions[id].availableOptions.includes(options[id])) {
            result[id] = defaultOptions[id].default;
          }
          else {
            result[id] = options[id];
          }
          break;
        default:
          result[id] = options[id];
      }
    }
  }

  for (id in defaultOptions) {
    if (defaultOptions.hasOwnProperty(id)) {
      if (result[id] === undefined) {
        result[id] = defaultOptions[id].default;
      }
    }
  }
  return result;
}

module.exports = {
  getEndPoint: getEndPoint,
  getHost: getHost,
  getHeaders: getHeaders,
  getBody: getBody,
  sanitizeOptions: sanitizeOptions
};
