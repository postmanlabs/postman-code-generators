module.exports = {
  /**
     * sanitizes input string by handling escape characters eg: converts '''' to '\'\''
     * and trim input if required
     *
     * @param {String} inputString
     * @param {Boolean} [trim] - indicates whether to trim string or not
     * @returns {String}
     */
  sanitize: function (inputString, trim) {
    if (typeof inputString !== 'string') {
      return '';
    }
    inputString = inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

    return trim ? inputString.trim() : inputString;
  },

  /**
    * sanitizes input options
    *
    * @param {Object} options - Options provided by the user
    * @param {Object} defaultOptions - default options object containing type and default for each property,
    *  built from getOptions array
    *
    * @returns {Object} - Sanitized options object
    */
  sanitizeOptions: function (options, defaultOptions) {
    var result = {},
      id;

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
};
