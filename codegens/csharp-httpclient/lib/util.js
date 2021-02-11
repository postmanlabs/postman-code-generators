/**
 * sanitizes input string by handling escape characters eg: converts '''' to '\'\'' and trim input if required
 * 
 * @param {String} inputString - Input string to sanitize
 * @param {Boolean} [trim] - Indicates whether to trim string or not
 * @returns {String} Sanitized String handling escape characters 
 */
function sanitize (inputString, trim) {
    /* instanbul ignore test */
    if (typeof inputString !== 'string') {
        return '';
    }
    inputString = inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return trim ? inputString.trim() : inputString;
}