
# onescript-1connector

> Converts Postman SDK Request -> Onescript-1connector Snippet Converter

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to swift code snippet.

### convert function
Convert function takes three parameters

* `request` - Postman-SDK Request Object

* `options` - options is an object which hsa following properties

* `callback` - callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var request = new sdk.Request('www.google.com'),  //using postman sdk to create request  
    options = {

    }};
convert(request, options, function(error, snippet) {
    if (error) {
        //  handle error
    }
    //  handle snippet
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
//    {
//      name: 'Trim request body fields',
//      id: 'trimRequestBody',
//      type: 'boolean',
//      default: false,
//      description: 'Remove white space and additional lines that may affect the server\'s response'
//    }
// ]
```
### Guidelines for using generated snippet

* Since Postman-SDK Request object doesn't provide complete path of the file, it needs to be manually inserted in case of uploading a file.

* This module doesn't support cookies.

### Resources

* Onescript-1connector official documentation [Onescript-1connector](https://github.com/vbondarevsky/1connector)

