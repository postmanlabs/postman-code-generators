module.exports = {
    /**
    * sanitization of values : trim, escape characters
    *
    * @param {String} inputString - input
    * @param {String} escapeCharFor - escape for headers, body: raw, formdata etc
    * @param {Boolean} [inputTrim] - whether to trim the input
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
                case 'formdata-key':
                    // eslint-disable-next-line quotes
                    return inputString.replace(/"/g, "'");
                case 'formdata-value':
                    // eslint-disable-next-line no-useless-escape
                    return inputString.replace(/\\\"/g, '\\\\\"').replace(/\"/g, '\\"');
                case 'header':
                    return inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                default:
                    return inputString.replace(/"/g, '\\"');
            }
        }
        return inputString;
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
                    case 'integer':
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
