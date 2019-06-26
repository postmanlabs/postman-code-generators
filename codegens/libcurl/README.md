# codegen-libcurl

>Converts Postman-SDK Request into code snippet for libcurl

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to libcurl code snippet.

### convert function
Convert function takes three parameters

* `request` - Postman-SDK Request Object

* `options` - options is an object which hsa following properties
    * `indentType` - String denoting type of indentation for code snippet. eg: 'space', 'tab'
    * `indentCount` - Integer denoting count of indentation required
    * `trimRequestBody` - Boolean denoting whether to trim request body fields
    * `protocol` - String denoting the protocol type used in the request
    *  `multiLine` - Boolean denoting whether to get the request in single or multiple lines

* `callback` - callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var request = new sdk.Request('www.google.com'),  //using postman sdk to create request  
    options = {
        indentCount: 3,
        indentType: 'space',
        trimRequestBody: true,
        protocol: 'https',
        multiLine: true
    };
convert(request, options, function(error, snippet) {
    if (error) {
        //  handle error
    }
    //  handle snippet
});
```
### Guidelines for using generated snippet

* Since Postman-SDK Request object doesn't provide complete path of the file, it needs to be manually inserted in case of uploading a file.

* This module doesn't support cookies.