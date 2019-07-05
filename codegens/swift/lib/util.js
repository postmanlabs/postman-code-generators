/**
 * Sanitizes input string by handling escape characters according to request body type
 *
 * @param {String} inputString - Input String to sanitize
 * @param {String} escapeCharFor - Escape character for headers, body: raw, formdata etc.
 * @param {Boolean} [inputTrim] - Indicates whether to trim string or not
 * @returns {String} Sanitized String handling escape characters
 */
function sanitize (inputString, escapeCharFor, inputTrim) {

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
      case 'formdata':
        return inputString.replace(/{/g, '[').replace(/}/g, ']');
        /* istanbul ignore next */
      case 'file':
        return inputString.replace(/{/g, '[').replace(/}/g, ']');
      case 'header':
        return inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        /* istanbul ignore next */
      default:
        return inputString.replace(/"/g, '\\"');
    }
  }
  return inputString;
}

module.exports = {
  sanitize: sanitize
};
