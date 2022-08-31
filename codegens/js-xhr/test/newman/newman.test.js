var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var boilerplateCode = 'var XMLHttpRequest = require(\'xmlhttprequest\').XMLHttpRequest;\n',
    testConfig = {
      compileScript: null,
      runScript: 'node snippet.js',
      fileName: 'snippet.js',
      skipCollections: ['redirectCollection', 'formdataCollection', 'formdataFileCollection', 'emptyFormdataCollection']
    },
    options = {};
  boilerplateCode += 'var FormData = require(\'form-data\');\n\n';
  testConfig.headerSnippet = boilerplateCode;
  runNewmanTest(convert, options, testConfig);
});
