var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('js-urlfetchapp Converter', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: 'snippet.js',
        // Run script required to run the generated code snippet
        runScript: 'node snippet.js',
        // Compile script required to compile the code snippet
        compileScript: '',
        // Array of name of collections for which newman tests has to be skipped.
        skipCollections: []
      };
    runNewmanTest(convert, options, testConfig);
  });
});
