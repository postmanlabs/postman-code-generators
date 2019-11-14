var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('PHP HttpRequest2 Converter', function () {
  describe('convert for different request types', function () {
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
