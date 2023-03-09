var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('r-httr Converter', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: 'snippet.r',
        // Run script required to run the generated code snippet
        runScript: 'Rscript snippet.r',
        skipCollections: ['redirectCollection', 'unsupportedMethods']
      };
    runNewmanTest(convert, options, testConfig);
  });
});
