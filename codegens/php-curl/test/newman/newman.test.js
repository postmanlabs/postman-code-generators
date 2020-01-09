var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var testConfig = {
      runScript: 'php codesnippet.php',
      fileName: 'codesnippet.php',
      compileScript: null,
      // php-curl picks only the last value if two form data params have same keys
      // No alternative to provide an array of files.
      // https://bugs.php.net/bug.php?id=51634
      skipCollections: ['formdataFileCollection']
    },
    options = {
      indentType: 'Space',
      indentCount: 4
    };

  runNewmanTest(convert, options, testConfig);

});
