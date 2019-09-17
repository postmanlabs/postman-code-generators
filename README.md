
![postman icon](https://raw.githubusercontent.com/postmanlabs/postmanlabs.github.io/develop/global-artefacts/postman-logo%2Btext-320x132.png) 

*Supercharge your API workflow.*  
*Modern software is built on APIs. Postman helps you develop APIs faster.*

# postman-code-generators [![Build Status](https://travis-ci.com/postmanlabs/postman-code-generators.svg?branch=master)](https://travis-ci.com/postmanlabs/postman-code-generators)

This module converts a Postman-SDK Request Object into a code snippet of chosen language.
 
List of supported code generators: 

* C# - RestSharp
* cURL
* Go
* HTTP
* Java - (OkHttp and Unirest)
* JavaScript - (Fetch, jQuery, and XHR)
* NodeJs - (Native, Request, and Unirest)
* OCaml - Cohttp
* PHP - (cURL and pech_http)
* Powershell - RestMethod
* Python - (http.client and Requests)
* Ruby - Net::HTTP
* Shell - (Httpie and wget)
* Swift - URLSession

## Table of contents 

1. [Getting Started](#getting-started)
2. [Prerequisites](#prerequisites)
3. [Usage](#usage)
    1. [Using Codegen as a Library](#using-codegen-as-a-library)
    2. [Guidelines for writing options copy](#guidelines-for-writing-options-copy)
4. [Installing Dependencies](#installing-dependencies)
5. [Testing](#testing)
12. [Contributing](#contributing)
14. [License](#license)

## Getting Started
To get a copy on your local machine
```bash
$ git clone https://github.com/postmanlabs/code-generators.git
```

## Prerequisite
To run any of the postman-code-generators, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

## Usage

### Using code generators as a Library 
There are three functions that are exposed in postman-code-generators: getLanguageList, getOptions, and convert.

#### getLanguageList
This function returns a list of supported code generators. 

##### Example:
```js
var codegen = require('postman-code-generators'), // require postman-code-generators in your project
    supportedCodegens = codegen.getLanguageList();
    console.log(supportedCodegens);
    // output:
    // [
    //   {
    //     key: 'nodejs',
    //     label: 'NodeJs',
    //     syntax_mode: 'javascript',
    //     variant: [
    //       {
    //         key: 'Requests'
    //       },
    //       {
    //         key: 'Native'
    //       },
    //       {
    //         key: 'Unirest'
    //       }
    //     ]
    //   },
    //   ...
    // ]
```

#### getOptions 

This function takes in three parameters and returns a callback  with error and supported options of that code generator.

* `language` - lang key from the language list returned from getLanguageList function
* `variant` - variant key provided by getLanguageList function
* `callbacl` - callback function with first parameter as error and second parameter as array of options supported by the codegen.


##### Example:
```js
var codegen = require('postman-code-generators'), // require postman-code-generators in your project
    language = 'nodejs',
    variant = 'requests';

    codegen.getOptions(language, variant, function (error, options) {
      if (error) {
        // handle error
      }
      console.log(options);
    });
```

#### convert 
This function takes in five parameters and returns a callback with error and generated code snippet
* `language` - lang key from the language list returned from getLanguageList function
* `variant` - variant key provided by getLanguageList function
* `request` - Postman-SDK Request Object
* `options` - Options that can be used to configure generated code snippet. 
* `callback` - callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var codegen = require('postman-code-generators'), // require postman-code-generators in your project
    request = new sdk.Request('www.google.com'),  //using postman sdk to create request 
    language = 'nodejs',
    variant = 'requests',
    options = {
        indentCount: 3,
        indentType: 'Space',
        trimRequestBody: true,
        followRedirect: true
    };
codegen.convert(language, variant, request, options, function(error, snippet) {
    if (error) {
        //  handle error
    }
    //  handle snippet
});
```
### Guidelines for writing options copy

#### Installing dependencies
This command will install all the dependencies in production mode.
```bash
$ npm install;
```
To install dev dependencies also for all codegens run: 
```bash
$ npm run deepinstall dev; 
```
To run common repo test as well as tests (common structure test + individual codegen tests) for all the codegens
```bash
$ npm test; 
```
To run structure and individual tests on a single codegen
```bash
$ npm test <codegen-name>;
# Here "codege-name" is the folder name of the codegen inside codegens folder
```

To create zipped package of all codegens
```bash
$ npm run package;
```
**Note:** The zipped package is created inside each codegen's folder.

To create zipped package of a single codegen
```bash
$ npm run package <codegen-name>
```

## Contributing
Please take a moment to read our [contributing guide](.github/CONTRIBUTING.md) to learn about our development process.
Open an [issue](https://github.com/postmanlabs/postman-code-generators/issues) first to discuss potential changes/additions.

## License
This software is licensed under Apache-2.0. Copyright Postdot Technologies, Inc. See the [LICENSE.md](LICENSE.md) file for more information.
