module.exports = {
/**
* sanitization of values : trim, escape characters
* 
* @param {String} inputString - input
* @param {String} escapeCharFor - escape for headers, body: raw, formdata etc 
* @param {Boolean} [inputTrim] - whether to trim the input
* @returns {String} 
*/
    sanitize: function (inputString, escapeCharFor, inputTrim) {

        if (typeof inputString !== 'string') {
            return '';
        }
        inputString = inputTrim && typeof inputTrim === 'boolean' ? inputString.trim() : inputString;
        if (escapeCharFor && typeof escapeCharFor === 'string') {
            switch (escapeCharFor) {
                case 'raw':
                    return inputString.replace(/'/g, '\'\\\'\'');
                case 'urlencoded':
                    return escape(inputString);
                case 'formdata':
                    return inputString.replace(/'/g, '\\\'');
                /* istanbul ignore next */
                case 'file':
                    return inputString.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
                case 'header':
                    return inputString.replace(/'/g, '\'\\\'\'');
                default:
                    return inputString.replace(/'/g, '\'');
            }
        }
        return inputString;
    }
};
