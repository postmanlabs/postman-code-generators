
# Contributing to Postman Code Generators



  - [Getting Started Quick](#getting-started-quick)
  - [Repository](#repository)
  - [Tests](#tests)

## Getting Started Quick

Instructions on initial setup can be found in the README.


## Repository

Directory               | Summary
------------------------|-----------------------------------------------------------------------------------------------
`codegens`                   | Contains modules for individual language/framework code generators
`lib`              | Contains code needed to orchestrate conversion with individual code generation modules. This is the part that the Postman app interfaces with.
`npm`                   | All CI/build/installation scripts (triggered by NPM run-script)
`test`                  | Contains test-scripts
`test/codegen`             | Runs functional tests on the individual generation modules
`test/system`           | Checks for proper code structuring and division across the code generators


## Tests
The CI pipeline on travis will check for code structure across all code generators, and runs functional tests. These tests run a fixed collection in [Newman](https://github.com/postmanlabs/newman), and run each request through the corresponding code generator, and execute it through the relevant interpreter. The responses from Newman and the language interpreter are compared. Except for a few Postman-specific headers, the responses should match.
This mechanism is in `test/unit/convert.test.js` for each code generator.

For some languages, it's not practical to run an interpreter for generated code. The JS-jQuery is an example. In such cases, the output of the conversion is compared against a known snippet that we know works correctly.


## Contributing
We'd be happy to accept fixes to known issues in any of the code-generators, as long it's a filed issue on the [issue tracker](https://github.com/postmanlabs/postman-code-generators/issues). For any non-trivial fixes, regression tests should be added as well. For a bug in the generated code, we'd recommend adding a request to the `collection.json` fixture, and comparing the response from Newman, and from the generated code.

Since the contents of this repository are bundled with the default Postman app that users download, contributions for new languages/frameworks will need some community support before we're able to accept a pull request. We're working on ways to streamline and quantify this requirement.

This document is a work-in-progress. We're working on adding guidelines to make contributions easier. Stay tuned!