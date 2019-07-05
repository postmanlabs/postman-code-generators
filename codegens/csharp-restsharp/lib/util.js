/**
 * sanitizes input string by handling escape characters eg: converts '''' to '\'\'' and trim input if required
 * 
 * @param {String} inputString - Input String to sanitize
 * @param {Boolean} [trim] - Indicates whether to trim string or not
 * @returns {String} Sanitized String handling escape characters
 */
function sanitize (inputString, trim) {
  /* istanbul ignore next */
  if (typeof inputString !== 'string') {
    throw new Error(`Csharp-Restsharp-Converter:function expects input to be string, found ${typeof inputString}`);
  }
  inputString = inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return trim ? inputString.trim() : inputString;
}

module.exports = {
  sanitize: sanitize
};
