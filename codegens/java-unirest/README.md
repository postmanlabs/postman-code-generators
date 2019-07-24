# codegen-java-unirest

> Converts Postman-SDK Request into code snippet for Java-unirest.

## Getting Started
 To get a copy on your local machine
```bash
$ git clone git@bitbucket.org:postmanlabs/codegen-java-unirest.git
```

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v6. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

#### Installing dependencies
```bash
$ npm install;
```

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to java-unirest code snippet.

### convert function
Convert function will take three parameters
* `request`- Postman-SDK Request object

* `options`- options is an object which can have following properties
    * `indentType`- string representing type of indentation for code snippet. eg: 'Space', 'Tab'
    * `indentCount`- positiveInteger representing count of indentation required.
    * `includeBoilerplate`- boolean representing whether to include class definition in code snippet 
    * `requestTimeout` : Integer denoting time after which the request will bail out in milli-seconds
    * `trimRequestBody` : Trim request body fields
    * `followRedirect` : Boolean denoting whether to redirect a request

* `callback`- callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var request = new sdk.Request('www.google.com'),  //using postman sdk to create request  
    options = {
        indentType: 'Space',
        indentCount: 2,
        includeBoilerplate: false
    };
convert(request, options, function(error, snippet) {
    if (error) {
        //  handle error
    }
    //  handle snippet
});
```

### Guideline for using generated snippet
* To download dependecies to use snippet please see [unirest-doc](http://unirest.io/java.html)

* This module supports six HTTP request methods. 
    **GET** **POST** **PUT** **PATCH** **DELETE**  **OPTIONS** **HEAD**
 
* If type of request body is `multipart/formdata` then atleast one entry must be of type file else it will be sent as `application/json` if no content-type is provided in header

* Since Postman-SDK Request object doesn't provide complete path of the file, it needs to be manually inserted in case of uploading a file.

* Since java unirest does not support special characters in URL. URL will be encoded in snippet

* This module doesn't support cookies.



## Running the tests

```bash
$ npm test
```

### Break down into unit tests

```bash
$ npm run test-unit
```