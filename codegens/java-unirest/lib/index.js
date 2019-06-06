
/**
 * Specifies the additional options applicable to this code generator other than standard options
 * 
 * @returns {Array} - Array of the particular options applicable to java unirest
 */
function getOptions () {
    return [
        {
            name: 'Indent Count',
            id: 'indentCount',
            type: 'integer',
            default: 0,
            description: 'Integer denoting count of indentation required'
        },
        {
            name: 'Indent type',
            id: 'indentType',
            type: 'String',
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
            id: 'requestBodyTrim',
            type: 'boolean',
            default: true,
            description: 'Boolean denoting whether to trim request body fields'
        },
        {
            name: 'Include Boilerplate',
            id: 'includeBoilerplate',
            type: 'boolean',
            default: false,
            description: 'Whether to include class definition and import statements in code snippet'
        }
    ];
}

module.exports = {
    convert: require('./unirest').convert,
    getOptions: getOptions
};
