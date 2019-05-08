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
        inputString = inputString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return trim ? inputString.trim() : inputString;
    },
    form: function (option, format) {
        if (format) {
            switch (option) {
                case '-s':
                    return '--silent';
                case '-L':
                    return '--location';
                case '-m':
                    return '--max-time';
                case '-I':
                    return '--head';
                case '-X':
                    return '--request';
                case '-H':
                    return '--header';
                case '-d':
                    return '--data';
                case '-F':
                    return '--form';
                case '--data-binary':
                    return '--data-binary';
                default:
                    return '';
            }
        }
        else {
            return option;
        }
    }
};
