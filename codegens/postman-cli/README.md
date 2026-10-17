# codegen-postman-cli

> Converts Postman-SDK Request into code snippet for Postman CLI.

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to Postman CLI code snippet and `getOptions` function which returns an array of supported options.

## Supported Features

### Authentication
The codegen supports all authentication types available in Postman CLI:
- **Basic Auth**: Username and password authentication
- **Bearer Token**: Token-based authentication
- **Digest Auth**: Digest authentication with realm, nonce, qop, etc.
- **OAuth 1.0**: OAuth 1.0 authentication with consumer key, token, signatures
- **OAuth 2.0**: OAuth 2.0 with access tokens
- **API Key**: API key in header or query parameters
- **Hawk**: Hawk authentication
- **NTLM**: NTLM authentication with domain support

### convert function
Convert function takes three parameters

* `request` - Postman-SDK Request Object

* `options` - options is an object which has following properties
    * `multiLine` - Boolean denoting whether to split command across multiple lines
    * `longFormat` - Boolean denoting whether to use long form options (--header instead of -H)
    * `lineContinuationCharacter` - Character used to mark continuation of statement on next line (\\, ^, or `)
    * `quoteType` - String denoting the quote type to use (single or double) for URL
    * `requestTimeoutInSeconds` - Integer denoting time after which the request will timeout in seconds
    * `followRedirect` - Boolean denoting whether to automatically follow HTTP redirects
    * `followOriginalHttpMethod` - Boolean denoting whether to redirect with original HTTP method
    * `maxRedirects` - Integer denoting maximum number of redirects to follow
    * `trimRequestBody` - Boolean denoting whether to trim request body fields
    * `quiet` - Boolean denoting whether to display requested data without extra output
    * `indentType` - String denoting type of indentation for code snippet. eg: 'Space', 'Tab'
    * `indentCount` - The number of indentation characters to add per code level

* `callback` - callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var request = new sdk.Request('www.google.com'),  //using postman sdk to create request  
    options = {
        indentCount: 3,
        indentType: 'Space',
        requestTimeoutInSeconds: 200,
        trimRequestBody: true,
        multiLine: true,
        followRedirect: true,
        followOriginalHttpMethod: false,
        maxRedirects: 0,
        longFormat: true,
        lineContinuationCharacter: '\\',
        quoteType: 'single',
        quiet: false
    };
convert(request, options, function(error, snippet) {
    if (error) {
        //  handle error
    }
    //  handle snippet
});
```

### Authentication Examples

#### Basic Authentication
```js
var request = new sdk.Request({
    url: 'https://postman-echo.com/basic-auth',
    method: 'GET',
    auth: {
        type: 'basic',
        basic: [
            { key: 'username', value: 'postman' },
            { key: 'password', value: 'password' }
        ]
    }
});

convert(request, {}, function(error, snippet) {
    console.log(snippet);
    // Output: postman request 'https://postman-echo.com/basic-auth' --auth-basic-username 'postman' --auth-basic-password 'password'
});
```

#### Bearer Token
```js
var request = new sdk.Request({
    url: 'https://api.example.com/data',
    method: 'GET',
    auth: {
        type: 'bearer',
        bearer: [
            { key: 'token', value: 'your-token-here' }
        ]
    }
});

convert(request, {}, function(error, snippet) {
    console.log(snippet);
    // Output: postman request 'https://api.example.com/data' --auth-bearer-token 'your-token-here'
});
```

#### API Key
```js
var request = new sdk.Request({
    url: 'https://api.example.com/data',
    method: 'GET',
    auth: {
        type: 'apikey',
        apikey: [
            { key: 'key', value: 'X-API-Key' },
            { key: 'value', value: 'my-secret-key' },
            { key: 'in', value: 'header' }
        ]
    }
});

convert(request, {}, function(error, snippet) {
    console.log(snippet);
    // Output: postman request 'https://api.example.com/data' --auth-apikey-key 'X-API-Key' --auth-apikey-value 'my-secret-key' --auth-apikey-in 'header'
});
```

### getOptions function

This function returns a list of options supported by this codegen.

#### Example
```js
var options = getOptions();

console.log(options);
// output
// [
//   {
//     name: 'Generate multiline snippet',
//     id: 'multiLine',
//     type: 'boolean',
//     default: true,
//     description: 'Split Postman CLI command across multiple lines'
//   },
//   {
//     name: 'Use long form options',
//     id: 'longFormat',
//     type: 'boolean',
//     default: true,
//     description: 'Use the long form for Postman CLI options (--header instead of -H)'
//   },
//   {
//     name: 'Line continuation character',
//     id: 'lineContinuationCharacter',
//     availableOptions: ['\\', '^', '`'],
//     type: 'enum',
//     default: '\\',
//     description: 'Set a character used to mark the continuation of a statement on the next line'
//   },
//   {
//     name: 'Quote Type',
//     id: 'quoteType',
//     availableOptions: ['single', 'double'],
//     type: 'enum',
//     default: 'single',
//     description: 'String denoting the quote type to use (single or double) for URL'
//   },
//   {
//     name: 'Set request timeout (in seconds)',
//     id: 'requestTimeoutInSeconds',
//     type: 'positiveInteger',
//     default: 0,
//     description: 'Set number of seconds the request should wait for a response before timing out (use 0 for infinity)'
//   },
//   {
//     name: 'Follow redirects',
//     id: 'followRedirect',
//     type: 'boolean',
//     default: true,
//     description: 'Automatically follow HTTP redirects'
//   },
//   {
//     name: 'Follow original HTTP method',
//     id: 'followOriginalHttpMethod',
//     type: 'boolean',
//     default: false,
//     description: 'Redirect with the original HTTP method instead of the default behavior of redirecting with GET'
//   },
//   {
//     name: 'Maximum number of redirects',
//     id: 'maxRedirects',
//     type: 'positiveInteger',
//     default: 0,
//     description: 'Set the maximum number of redirects to follow, defaults to 0 (unlimited)'
//   },
//   {
//     name: 'Trim request body fields',
//     id: 'trimRequestBody',
//     type: 'boolean',
//     default: false,
//     description: 'Remove white space and additional lines that may affect the server\'s response'
//   },
//   {
//     name: 'Use Quiet Mode',
//     id: 'quiet',
//     type: 'boolean',
//     default: false,
//     description: 'Display the requested data without showing any extra output.'
//   }
// ]
```
### Guidelines for using generated snippet

* Since Postman-SDK Request object doesn't provide complete path of the file, it needs to be manually inserted in case of uploading a file.

* The generated snippet uses the `postman request` command from the Postman CLI. Make sure you have the Postman CLI installed to run the generated commands.
