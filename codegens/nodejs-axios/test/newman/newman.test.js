var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('nodejs-axios Converter', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: 'codesnippet.js',
        // Run script required to run the generated code snippet
        runScript: 'node codesnippet.js',
        // Compile script required to compile the code snippet
        // compileScript: 'mkdir request-axios;cd request-axios;npm init -y;npm install axios',
        compileScript: '',
        // Array of name of collections for which newman tests has to be skipped.
        skipCollections: ['sameNameHeadersCollection', 'formdataCollection', 'formdataFileCollection']
      };
    runNewmanTest(convert, options, testConfig);
  });
});
