var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;

describe('Convert for different types of request', function () {
  var testConfig = {
      runScript: 'go run snippet.go',
      compileScript: null,
      fileName: 'snippet.go'
    },
    options = {
      indentCount: 1,
      indentType: 'Tab'
    };
  runNewmanTest(convert, options, testConfig);
});
