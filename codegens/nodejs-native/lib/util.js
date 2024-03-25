const _ = require('./lodash');

/**
   * sanitizes input string by handling escape characters eg: converts '''' to '\'\''
   * and trim input if required
   *
   * @param {String} inputString
   * @param {Boolean} [trim] - indicates whether to trim string or not
   * @returns {String}
   */
function sanitize (inputString, trim) {
  if (typeof inputString !== 'string') {
    return '';
  }
  (trim) && (inputString = inputString.trim());
  return inputString.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n');
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
* @param {Object} url - The Postman URL object
* @returns {String}
*
* Remove protocol from url if present
*/
function getHostWithoutProtocol (url) {
  return url.host.join('.')
    .replace(/^https?:\/\//, '');
}

/**
 * @param {Object} url - The Postman URL object
 * @returns {String}
 *
 * Return host from the URL
 */
function getHost (url) {
  return getHostWithoutProtocol(url).split('/')[0];
}

/**
 * @param {Object} url - The Postman URL object
 * @returns {String}
 *
 * Return the path from a URL
 */
function getPath (url) {
  var segments = [];
  // Sometimes url.host contains protocol as well as path
  // Extract that here
  if (getHost(url).length !== url.host.join('.').length) {
    url.path = getHostWithoutProtocol(url).split('/').slice(1).concat(url.path);
  }
  if (url.path) {
    segments = _.reduce(url.path, function (res, segment) {
      var variable;

      // check if the segment has path variable prefix followed by the variable name.
      if (segment.length > 1 && segment[0] === ':') {
        variable = url.variables.one(segment.slice(1)); // remove path variable prefix.
      }

      variable = variable && variable.valueOf && variable.valueOf();
      res.push(typeof variable === 'string' ? variable : segment);
      return res;
    }, []);
  }

  return '/' + segments.join('/'); // add leading slash
}

module.exports = {
  sanitize,
  sanitizeOptions,
  addFormParam,
  getHost,
  getPath
};
