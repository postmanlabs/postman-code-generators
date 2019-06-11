module.exports = {
    convert: require('./okhttp'),

    /**
     * Used in order to get options for generation of Java okhattp code snippet (i.e. Include Boilerplate code)
     *
     * @module getOptions
     *
     * @returns {Array} Options specific to generation of Java okhattp code snippet
     */
    getOptions: function () {
        return [
            {
                name: 'Include Boilerplate',
                id: 'includeBoilerplate',
                type: 'boolean',
                default: false,
                description: 'Boolean denoting whether to include class definition and import statements in snippet'
            },
            {
                name: 'Indent Count',
                id: 'indentCount',
                type: 'integer',
                default: 1,
                description: 'Integer denoting count of indentation required'
            },
            {
                name: 'Indent type',
                id: 'indentType',
                type: 'enum',
                availableOptions: ['tab', 'space'],
                default: 'tab',
                description: 'String denoting type of indentation for code snippet. eg: \'space\', \'tab\''
            },
            {
                name: 'Request Timeout',
                id: 'requestTimeout',
                type: 'integer',
                default: 0,
                description: 'Integer denoting time after which the request will bail out in milliseconds'
            },
            {
                name: 'Follow redirect',
                id: 'followRedirect',
                type: 'boolean',
                default: true,
                description: 'Boolean denoting whether or not to automatically follow redirects'
            },
            {
                name: 'Body trim',
                id: 'trimRequestBody',
                type: 'boolean',
                default: true,
                description: 'Boolean denoting whether to trim request body fields'
            }
        ];
    }
};
