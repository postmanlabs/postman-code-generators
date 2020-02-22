var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil')
    .runNewmanTest,
  convert = require('../../index').convert

describe('Axios Converter', function() {
  describe('convert for different request types', function() {
    var options = {
        indentType: 'Space',
        indentCount: 4,
      },
      testConfig = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: 'run.js',
        // Run script required to run the generated code snippet
        runScript: 'node run.js',

        // Compile script required to compile the code snippet
        compileScript: null,
        // Array of name of collections for which newman tests has to be skipped.
        skipCollections: [],
        headerSnippet: '/* eslint-disable */\n',
      }
    runNewmanTest(convert, options, testConfig)
  })
})
