var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('R-Rcurl Converter', function () {
  describe('Convert for different types of request', function () {
    var testConfig = {
        runScript: 'rscript codesnippet.r',
        fileName: 'codesnippet.r',
        compileScript: null
      },
      options = {
        indentType: 'Space',
        indentCount: 4
      };
    runNewmanTest(convert, options, testConfig);
  });
});
