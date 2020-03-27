var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('dart Converter', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: 'codesnippet.dart',
        // Run script required to run the generated code snippet
        runScript: 'dart codesnippet.dart',
        // Compile script required to compile the code snippet
        // eslint-disable-next-line max-len
        compileScript: '/usr/lib/node_modules/pub/bin/pub  get',
        // Array of name of collections for which newman tests has to be skipped.
        skipCollections: ['sameNameHeadersCollection', 'formdataCollection', 'formdataFileCollection']
      };
    runNewmanTest(convert, options, testConfig);
  });
});
