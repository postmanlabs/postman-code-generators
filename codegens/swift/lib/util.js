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

/**
 * sanitizes input options
 *
 * @param {Object} options - Options provided by the user
 * @param {Object} defaultOptions - default options object containing type and default for each property,
 *  built from getOptions array
 *
 * @returns {Object} - Sanitized options object
 */
function sanitizeOptions (options, defaultOptions) {
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

module.exports = {
    sanitize: sanitize,
    sanitizeOptions: sanitizeOptions
};
