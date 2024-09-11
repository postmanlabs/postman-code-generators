var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var testConfig = {
      runScript: 'java -cp *: Main',
      compileScript: 'javac -cp *: Main.java',
      fileName: 'Main.java',
      skipCollections: ['formdataCollection', 'emptyFormdataCollection', 'unsupportedMethods']
    },
    options = {includeBoilerplate: true};

  runNewmanTest(convert, options, testConfig);
});
