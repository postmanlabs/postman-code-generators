var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('PHP-Guzzle Converter', function () {

  describe('Convert for different types of request for sync', function () {
    var testConfig = {
        runScript: 'php codesnippet.php',
        fileName: 'codesnippet.php',
        compileScript: null,
        skipCollections: ['unsupportedMethods']
      },
      options = {
        indentType: 'Space',
        indentCount: 4,
        asyncType: 'sync',
        includeBoilerplate: true
      };
    runNewmanTest(convert, options, testConfig);
  });
  describe('Convert for different types of request for async', function () {
    var testConfig = {
        runScript: 'php codesnippet.php',
        fileName: 'codesnippet.php',
        compileScript: null,
        skipCollections: ['unsupportedMethods']
      },
      options = {
        indentType: 'Space',
        indentCount: 4,
        asyncType: 'async',
        includeBoilerplate: true
      };
    runNewmanTest(convert, options, testConfig);
  });
});
