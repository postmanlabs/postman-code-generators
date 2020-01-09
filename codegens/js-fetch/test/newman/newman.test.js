var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var testSnippet = 'var fetch = require(\'node-fetch\'),\nFormData = require(\'form-data\'),\n',
    testConfig = {
      compileScript: null,
      runScript: 'node snippet.js',
      fileName: 'snippet.js',
      skipCollections: ['formdataFileCollection']
    },
    options = {
      multiLine: true
    };
  testSnippet += 'Headers = require(\'node-fetch\').Headers,\n';
  testSnippet += 'URLSearchParams = require(\'url\').URLSearchParams;\n\n';
  testConfig.headerSnippet = testSnippet;
  runNewmanTest(convert, options, testConfig);
});
