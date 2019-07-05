module.exports = {
/**
* Sanitizes input string by handling escape characters according to request body type
* 
* @param {String} inputString - Input String to sanitize
* @param {String} escapeCharFor - Escape for headers, body: raw, formdata etc 
* @param {Boolean} [inputTrim] - Whether to trim the input
* @returns {String} Sanitized String handling escape characters
*/
  sanitize: function (inputString, escapeCharFor, inputTrim) {

    if (typeof inputString !== 'string') {
      return '';
    }
    inputString = inputTrim && typeof inputTrim === 'boolean' ? inputString.trim() : inputString;
    if (escapeCharFor && typeof escapeCharFor === 'string') {
      switch (escapeCharFor) {
        case 'raw':
          return JSON.stringify(inputString);
        case 'urlencoded':
          return escape(inputString);
          /* istanbul ignore next */
        case 'formdata':
          return inputString.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
          /* istanbul ignore next */
        case 'file':
          return inputString.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
        case 'header':
          return inputString.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
        default:
          return inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      }
    }
    return inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
};
