
/**
 * Specifies the additional options applicable to this code generator other than standard options
 *
 * @returns {Array} - Array of the particular options applicable to java unirest
 */
function getOptions () {
    return [
        {
            name: 'Include boilerplate',
            id: 'includeBoilerplate',
            type: 'boolean',
            default: false,
            description: 'Include class definition and import statements in snippet'
        },
        {
            name: 'Indent count',
            id: 'indentCount',
            type: 'integer',
            default: 0,
            description: 'Number of indentation characters to add per code level'
        },
        {
            name: 'Indent type',
            id: 'indentType',
            type: 'enum',
            availableOptions: ['tab', 'space'],
            default: 'tab',
            description: 'Character used for indentation'
        },
        {
            name: 'Request timeout',
            id: 'requestTimeout',
            type: 'integer',
            default: 0,
            description: 'How long the request should wait for a response before timing out (milliseconds)'
        },
        {
            name: 'Follow redirect',
            id: 'followRedirect',
            type: 'boolean',
            default: true,
            description: 'Automatically follow HTTP redirects'
        },
        {
            name: 'Body trim',
            id: 'trimRequestBody',
            type: 'boolean',
            default: true,
            description: 'Trim request body fields'
        }
    ];
}

module.exports = {
    convert: require('./unirest').convert,
    getOptions: getOptions
};
