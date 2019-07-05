# codegen-js-xhr
>Converts Postman-SDK Request into code snippet for JS XHR

## Getting Started
To get a copy on your local machine
```bash
$ git clone git@bitbucket.org:postmanlabs/codegen-js-xhr.git
```
#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v6. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

#### Installing dependencies
```bash
$ npm install;
```

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to js-xhr code snippet.

### convert function
Convert function takes three parameters

* `request` - Postman-SDK Request Object

* `options` - options is an object which hsa following properties
    * `indentType` - String denoting type of indentation for code snippet. eg: 'space', 'tab'
    * `indentCount` - Number of indentation characters to add per code level
    * `trimRequestBody` - Trim request body fields
    * `followRedirect` - Boolean denoting whether to redirect a request
    * `requestTimeout` - Integer denoting time after which the request will bail out in milli-seconds

* `callback` - callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var request = new sdk.Request('www.google.com'),  //using postman sdk to create request  
    options = {
        indentCount: 3,
        indentType: 'space',
        requestTimeout: 200,
        trimRequestBody: true,
        followRedirect: true
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


## Running the tests

```bash
$ npm test
```

### Break down into unit tests

```bash
$ npm run test-unit
```