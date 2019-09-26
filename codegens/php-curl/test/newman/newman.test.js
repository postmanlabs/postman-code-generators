var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var testConfig = {
      runScript: 'php codesnippet.php',
      fileName: 'codesnippet.php',
      compileScript: null
    },
    options = {
      indentType: 'Space',
      indentCount: 4
    };

  runNewmanTest(convert, options, testConfig);

});
