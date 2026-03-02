var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('R-Rcurl Converter', function () {
  describe('Convert for different types of request', function () {
    var testConfig = {
        runScript: 'Rscript codesnippet.r',
        fileName: 'codesnippet.r',
        compileScript: null,
        skipCollections: ['unsupportedMethods']

      },
      options = {
        indentType: 'Space',
        indentCount: 4,
        ignoreWarnings: true
      };
    runNewmanTest(convert, options, testConfig);
  });
});
