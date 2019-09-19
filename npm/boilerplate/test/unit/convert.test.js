var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;


describe('<<CODEGEN_NAME>> Converter', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        fileName: '',
        runScript: '',
        compileScript: ''
      };
    runNewmanTest(convert, options, testConfig);
  });
});
