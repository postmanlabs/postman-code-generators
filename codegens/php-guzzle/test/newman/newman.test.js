var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('PHP-Guzzle Converter', function () {

  describe('Convert for different types of request', function () {
    var testConfig = {
        runScript: 'php codesnippet.php',
        fileName: 'codesnippet.php',
        compileScript: null
      },
      options = {
        indentType: 'Space',
        indentCount: 4,
        asyncType: 'sync'
      };
    runNewmanTest(convert, options, testConfig);
  });
});
