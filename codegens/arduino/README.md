# codegen-arduino

> Converts Postman-SDK Request into code snippet for [Arduino](https://www.arduino.cc/en/Guide/Introduction) code.

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from 

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to HTTP spec and `getOptions` function which returns an array of supported options.

### convert function
Convert function takes three parameters

* `request` - Postman-SDK Request Object

* `options` - options is an object which has following properties
    * `trimRequestBody` - Trim request body fields

* `callback` - callback function with first parameter as error and second parameter as string for code snippet


##### Example:
```js
var request = new sdk.Request('www.example.com'),  //using postman sdk to create request  
    options = {};
convert(request, options, function(error, snippet) {
    if (error) {
        console.error(error);
        return;
    }
    console.log(snippet)
});
```
### getOptions function

This function returns a list of options supported by this codegen.

#### Example
```js
var options = getOptions();

console.log(options);
// output
// []
```
### Guidelines for using generated snippet

* Since Postman-SDK Request object doesn't provide complete path of the file, it needs to be manually inserted in case of uploading a file.

* This module doesn't support cookies.

