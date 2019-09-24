
# Contributing to Postman Code Generators



  - [Getting Started Quick](#getting-started-quick)
  - [Repository](#repository)
  - [General Instructions](#general-instructions)
  - [Pull request guidelines](#pull-request-guidelines)
  - [Security guildelines](security-guidelines)
  - [Build Failures](build-failures)
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

## General Instructions

### Types of contributions
One of the following two contributions are possible for postman-code-generators:
  - New Code Generator: To add a new code generator, create a pull request to the develop branch of postman-code-generators. Since these code-generators are bundled with the app, they follow a particular structure as mentioned above. We have created a boilerplate for you to get started quickly. Simple run:
  
  ```bash
  $ npm run boilerplate <<codegen-name>>
  ```

  - Bug fixes to existing codegens: We'd be happy to accept fixes to known issues in any of the code-generators, as long it's a filed issue on the [issue tracker](https://github.com/postmanlabs/postman-code-generators/issues). 

### Pull request guidelines

  - All pull requests should be to the develop branch. 
  - Every pull request should have associated issue(s) on our [issue tracker](https://github.com/postmanlabs/postman-code-generators/issues).
  - For any non-trivial fixes, regression tests should be added as well. For a bug, we also recommend adding a request to the `testCollection.json` found inside `test/codegen/newman/fixtures` to run the request using common newman tests.
  - For a new language to be added as a part of postman-code-generators, we will need some level of community support before we are able to accept the pull request. Feel free to add links to any sort of report/statistics from trusted sources that might help us understand the relavance and popularity of this language among users.

## Security guidelines
If you've found a vulnerability, or want additional information regarding how we manage security, please send an email to security@getpostman.com. We will review it and respond to you within 24 hours. Please use our [PGP public key](https://assets.getpostman.com/getpostman/documents/publickey.txt) to encrypt your communications with us.

## Build Failures
Some common reasons for travis build failures:
- If you've added a new code generator, you might have to add some dependencies in `npm/ci-requirements` for running the code snippet on travis. We use the [xenial build](https://docs.travis-ci.com/user/reference/xenial/) of travis. If appropriate dependencies are not added, the newman tests for the codegen will fail.
- Use of `sudo` before bash commands. This is enforced by travis and not adding this will throw error.


## Tests
The CI pipeline on travis will check for code structure across all code generators, and runs functional tests. These tests run a fixed collection in [Newman](https://github.com/postmanlabs/newman), and run each request through the corresponding code generator, and execute it through the relevant interpreter. The responses from Newman and the language interpreter are compared. Except for a few Postman-specific headers, the responses should match.
This mechanism is present in `test/codegen/newman`. The newmanTestUtil.js file exposes runNewmanTest function which is used to run and compare generated code snippet with newman responses. 

For some languages, it's not practical to run an interpreter for generated code. The JS-jQuery is an example. In such cases, the output of the conversion is compared against a known snippet that we know works correctly.


This document is a work-in-progress. We're working on adding guidelines to make contributions easier. Stay tuned!