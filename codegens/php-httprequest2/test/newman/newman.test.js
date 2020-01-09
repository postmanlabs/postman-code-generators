var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('PHP HttpRequest2 Converter', function () {
  // Skipping newman tests for now
  // TODO: Addition of set_include_path() in generated snippet
  describe.skip('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        runScript: 'php codesnippet.php',
        fileName: 'codesnippet.php'
      };
    runNewmanTest(convert, options, testConfig);
  });
});
