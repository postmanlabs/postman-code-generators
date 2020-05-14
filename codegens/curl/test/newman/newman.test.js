var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;

  // eslint-disable-next-line
describe.skip('Convert for different types of request', function () {
  var testConfig = {compileScript: null, runScript: null, fileName: null},
    options = {
      indentCount: 3,
      indentType: 'Space',
      requestTimeout: 200,
      multiLine: true,
      followRedirect: true,
      longFormat: true,
      silent: true,
      lineContinuationCharacter: '\\'
    };

  runNewmanTest(convert, options, testConfig);
});
