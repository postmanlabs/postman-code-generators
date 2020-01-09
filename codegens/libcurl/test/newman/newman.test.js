var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var options = {
      indentCount: 1,
      indentType: 'Tab',
      useMimeType: false,
      includeBoilerplate: true
    },
    testConfig = {
      compileScript: '`curl-config --cc --cflags` -o executableFile testFile.c `curl-config --libs`',
      runScript: './executableFile',
      fileName: 'testFile.c',
      skipCollections: ['formdataFileCollection']
    };
  runNewmanTest(convert, options, testConfig);
});
