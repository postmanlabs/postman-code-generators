module.exports = {
    /**
     * sanitizes input string by handling escape characters eg: converts '''' to '\'\''
     * and trim input if required
     * 
     * @param {String} inputString - Input string being sanitized
     * @param {Boolean} [trim] - indicates whether to trim string or not
     * @returns {String} 
     */
    sanitize: function (inputString, trim) {
        if (typeof inputString !== 'string') {
            return '';
        }
        inputString = inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return trim ? inputString.trim() : inputString;

    }
};
