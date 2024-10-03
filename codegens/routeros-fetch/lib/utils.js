let _ = require('./lodash'),
  path = require('path');

const FORM_DATA_BOUNDARY = '----FormDataVariable',
  RAW = 'raw',
  GRAPHQL = 'graphql',
  URL_ENCODED = 'urlencoded',
  FORM_DATA = 'formdata',
  FILE = 'file';

var contentTypeHeaderMap = {
  'aac': 'audio/aac',
  'abw': 'application/x-abiword',
  'arc': 'application/x-freearc',
  'avi': 'video/x-msvideo',
  'azw': 'application/vnd.amazon.ebook',
  'bin': 'application/octet-stream',
  'bmp': 'image/bmp',
  'bz': 'application/x-bzip',
  'bz2': 'application/x-bzip2',
  'csh': 'application/x-csh',
  'css': 'text/css',
  'csv': 'text/csv',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'eot': 'application/vnd.ms-fontobject',
  'epub': 'application/epub+zip',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/vnd.microsoft.icon',
  'ics': 'text/calendar',
  'jar': 'application/java-archive',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'text/javascript',
  'json': 'application/json',
  'jsonld': 'application/ld+json',
  'mid': 'audio/midi',
  'midi': 'audio/midi',
  'mjs': 'text/javascript',
  'mp3': 'audio/mpeg',
  'mpeg': 'video/mpeg',
  'mpkg': 'application/vnd.apple.installer+xml',
  'odp': 'application/vnd.oasis.opendocument.presentation',
  'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  'odt': 'application/vnd.oasis.opendocument.text',
  'oga': 'audio/ogg',
  'ogv': 'video/ogg',
  'ogx': 'application/ogg',
  'otf': 'font/otf',
  'png': 'image/png',
  'pdf': 'application/pdf',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'rar': 'application/x-rar-compressed',
  'rtf': 'application/rtf',
  'sh': 'application/x-sh',
  'svg': 'image/svg+xml',
  'swf': 'application/x-shockwave-flash',
  'tar': 'application/x-tar',
  'tif': 'image/tiff',
  'tiff': 'image/tiff',
  'ts': 'video/mp2t',
  'ttf': 'font/ttf',
  'txt': 'text/plain',
  'vsd': 'application/vnd.visio',
  'wav': 'audio/wav',
  'weba': 'audio/webm',
  'webm': 'video/webm',
  'webp': 'image/webp',
  'woff': 'font/woff',
  'woff2': 'font/woff2',
  'xhtml': 'application/xhtml+xml',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xml': 'text/xml',
  'xul': 'application/vnd.mozilla.xul+xml',
  'zip': 'application/zip',
  '3gp': 'video/3gpp',
  '7z': 'application/x-7z-compressed',
  '7-zip': 'application/x-7z-compressed'
};

/**
 * Converts a string into a RouterOS string, including escaping any invalid chars
 *
 * @param {String} str - input
 * @param {Boolean} quote - return surrounded by quotes
 */
function escapeRouterOSString (str, quote = true) {
  let escapedStr = '';

  // convert non-printables or higher high to byte syntax (& preserve escapes like \n)
  const toHex = (char) => {
    let code = char.charCodeAt(0);
    if (code === 10) { return '\\n'; }
    if (code === 13) { return '\\r'; }
    if (code === 9) { return '\\t'; }
    if (code === 7) { return '\\a'; }
    if (code === 8) { return '\\b'; }
    if (code === 12) { return '\\f'; }
    if (code === 11) { return '\\v'; }
    return '\\' + ('0' + code.toString(16)).slice(-2).toUpperCase();
  };

  // loop through string to find chars requiring escaping
  for (let i = 0; i < str.length; i++) {
    const char = str[i],
      code = char.charCodeAt(0);

    // Handle control characters (ASCII 0-31) and high ASCII (ASCII > 127)
    if (code < 32 || code > 127) {
      escapedStr += toHex(char);
    }
    // Escape backslashes
    else if (char === '\\') {
      escapedStr += '\\\\';
    }
    // Escape double quotes
    else if (char === '"') {
      escapedStr += '\\"';
    }
    // Escape dollar signs
    else if (char === '$') {
      escapedStr += '\\$';
    }
    // Handle regular characters
    else {
      escapedStr += char;
    }
  }

  if (quote) {
    return `"${escapedStr}"`;
  }
  return escapedStr;
}

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
 * Url encodes the members of the property list.
 *
 * @param {Object} propertyList propertyList
 * @param {String} joinUsing specify string that should be used to join the list of properties
 * @param {Boolean} includeDisabled indicated whether or not to include disabled properties
 * @param {Boolean} trimRequestBody indicates whether or not to trim request body
 * @returns {String} Stringified and Url encoded property List
 */
function convertPropListToStringUrlEncoded (propertyList, joinUsing, includeDisabled = false, trimRequestBody = false) {
  const properties = getMembersOfPropertyList(propertyList, includeDisabled),
    keyvalues = [];

  properties.forEach((property) => {
    const key = trimRequestBody ? property.key.trim() : property.key,
      value = trimRequestBody ? property.value.trim() : property.value,
      keyvalue = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    keyvalues.push(keyvalue);
  });

  return keyvalues.join(joinUsing);
}


/**
 *
 * @param {Array} array - form data array
 * @param {String} key - key of form data param
 * @param {String} type - type of form data param(file/text)
 * @param {String} val - value/src property of form data param
 * @param {String} disabled - Boolean denoting whether the param is disabled or not
 * @param {String} contentType - content type header of the param
 *
 * Appends a single param to form data array
 */
function addFormParam (array, key, type, val, disabled, contentType) {
  if (type === 'file') {
    array.push({
      key: key,
      type: type,
      src: val,
      disabled: disabled,
      contentType: contentType
    });
  }
  else {
    array.push({
      key: key,
      type: type,
      value: val,
      disabled: disabled,
      contentType: contentType
    });
  }
}

/**
 * Returns the request headers as a string
 *
 * @param {Object} request - Postman SDK request
 * @returns {Function} calls convertPropertyListToString
 */
function getHeadersArray (request) {

  // always add boundary to header for "formdata" bodies
  if (request.headers.has('Content-Type')) {
    if (request.headers.get('Content-Type') === 'multipart/form-data' ||
      (request.body && request.body.mode === 'formdata') && request.body.formdata) {
      request.headers.upsert({key: 'Content-Type', value: `multipart/form-data; boundary=${FORM_DATA_BOUNDARY}`});
    }
  }
  else if (request.body && request.body.mode === 'formdata' && request.body.formdata) {
    request.headers.add({key: 'Content-Type', value: `multipart/form-data; boundary=${FORM_DATA_BOUNDARY}`});
  }

  let stringArray = [];
  stringArray = request.headers.filter((i) => { return i.disabled !== true; }).map((i) => { return `${i}`; });

  return stringArray;
}

/**
 * Returns the request body as a string
 *
 * @param {Object} request - Postman SDK request
 * @param {Boolean} trimRequestBody - Determines whether to trim the body
 * @returns {String} returns Body of the request
 */
function getBody (request, trimRequestBody) {
  // pre-process body to add headers
  if (request.body && !request.headers.has('Content-Type')) {
    if (request.body.mode === 'file') {
      request.addHeader({
        key: 'Content-Type',
        value: 'text/plain'
      });
    }
    else if (request.body.mode === 'graphql') {
      request.addHeader({
        key: 'Content-Type',
        value: 'application/json'
      });
    }
  }

  // The following code handles multiple files in the same formdata param.
  // It removes the form data params where the src property is an array of filepath strings
  // Splits that array into different form data params with src set as a single filepath string
  if (request.body && request.body.mode === 'formdata') {
    let formdata = request.body.formdata,
      formdataArray = [];
    formdata.members.forEach((param) => {
      let key = param.key,
        type = param.type,
        disabled = param.disabled,
        contentType = param.contentType;
      // check if type is file or text
      if (type === 'file') {
        // if src is not of type string we check for array(multiple files)
        if (typeof param.src !== 'string') {
          // if src is an array(not empty), iterate over it and add files as separate form fields
          if (Array.isArray(param.src) && param.src.length) {
            param.src.forEach((filePath) => {
              addFormParam(formdataArray, key, param.type, filePath, disabled, contentType);
            });
          }
          // if src is not an array or string, or is an empty array, add a placeholder for file path(no files case)
          else {
            addFormParam(formdataArray, key, param.type, '/path/to/file', disabled, contentType);
          }
        }
        // if src is string, directly add the param with src as filepath
        else {
          addFormParam(formdataArray, key, param.type, param.src, disabled, contentType);
        }
      }
      // if type is text, directly add it to formdata array
      else {
        addFormParam(formdataArray, key, param.type, param.value, disabled, contentType);
      }
    });
    request.body.update({
      mode: 'formdata',
      formdata: formdataArray
    });
  }

  let requestBody = '';
  /* istanbul ignore else */
  if (request.body) {
    switch (request.body.mode) {
      case RAW:
        if (!_.isEmpty(request.body[request.body.mode])) {
          requestBody += request.body[request.body.mode].toString();
        }
        return trimRequestBody ? requestBody.trim() : requestBody;

      case GRAPHQL:
        // eslint-disable-next-line no-case-declarations
        let graphql = request.body[request.body.mode],
          query = graphql ? graphql.query : '',
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(graphql ? graphql.variables : '{}');
        }
        catch (e) {
          graphqlVariables = {};
        }
        requestBody += JSON.stringify({
          query: query || '',
          variables: graphqlVariables
        });
        return trimRequestBody ? requestBody.trim() : requestBody;
      case URL_ENCODED:
        /* istanbul ignore else */
        if (!_.isEmpty(request.body[request.body.mode])) {
          const propertyList = request.body[request.body.mode];
          requestBody += convertPropListToStringUrlEncoded(propertyList, '&', false, trimRequestBody);
        }
        return trimRequestBody ? requestBody.trim() : requestBody;

      case FORM_DATA:
        if (!_.isEmpty(request.body[request.body.mode])) {
          let properties = getMembersOfPropertyList(request.body[request.body.mode]),
            numberOfProperties = properties.length;
          if (numberOfProperties > 1) {
            requestBody += `--${FORM_DATA_BOUNDARY}\n`;
          }
          _.forEach(properties, function (property, index) {
            /* istanbul ignore else */
            if (property.type === 'text') {
              requestBody += 'Content-Disposition: form-data; name="';
              requestBody += `${(trimRequestBody ? property.key.trim() : property.key)}"\r\n`;
              if (property.contentType) {
                requestBody += `Content-Type: ${property.contentType}\r\n`;
              }
              requestBody += `\r\n${(trimRequestBody ? property.value.trim() : property.value)}\r\n`;
            }
            else if (property.type === 'file') {
              var pathArray = property.src.split(path.sep),
                fileName = pathArray[pathArray.length - 1],
                fileExtension = fileName.split('.')[1];
              requestBody += 'Content-Disposition: form-data; name="';
              requestBody += `${(trimRequestBody ? property.key.trim() : property.key)}"; filename="`;
              requestBody += `${fileName}"\r\n`;
              if (contentTypeHeaderMap[fileExtension]) {
                requestBody += `Content-Type: ${contentTypeHeaderMap[fileExtension]}\r\n\r\n`;
              }
              else {
                requestBody += 'Content-Type: <Content-Type header here>\r\n\r\n';
              }
              requestBody += `$[/file get ${fileName} contents]\r\n`;
            }
            if (index === numberOfProperties - 1) {
              requestBody += `--${FORM_DATA_BOUNDARY}--\r\n`;
            }
            else {
              requestBody += `--${FORM_DATA_BOUNDARY}\r\n`;
            }
          });
        }
        return trimRequestBody ? requestBody.trim() : requestBody;

      case FILE:
        return '"<file contents here>"';
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
  getHeadersArray: getHeadersArray,
  getBody: getBody,
  sanitizeOptions: sanitizeOptions,
  addFormParam: addFormParam,
  escapeRouterOSString: escapeRouterOSString
};

