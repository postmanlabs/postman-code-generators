module.exports = {
    /**
    * used to sanitize eg: trim, handle escape characters
    * @param {String} inputString - input
    * @param {Boolean} [inputTrim] - whether to trim the input
    * @returns {String} 
    */

    sanitize: function (inputString, inputTrim) {
        if (typeof inputString !== 'string') {
            return '';
        }

        inputString = inputTrim && typeof inputTrim === 'boolean' ? inputString.trim() : inputString;
        return inputString.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
    }
};
