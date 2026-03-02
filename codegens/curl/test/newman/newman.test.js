var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;

describe('Convert for different types of request', function () {
  var testConfig = {compileScript: null, runScript: null, fileName: null},
    options1 = {
      indentCount: 3,
      indentType: 'Space',
      requestTimeout: 200,
      multiLine: true,
      followRedirect: true,
      longFormat: true,
      silent: true,
      lineContinuationCharacter: '\\',
      quoteType: 'single'
    },
    options2 = {
      indentCount: 3,
      indentType: 'Space',
      requestTimeout: 200,
      multiLine: true,
      followRedirect: true,
      longFormat: false,
      silent: true,
      lineContinuationCharacter: '\\',
      quoteType: 'single'
    };

  runNewmanTest(convert, options1, testConfig);
  runNewmanTest(convert, options2, testConfig);
});
