var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  describe('Run tests for Python 2', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        fileName: 'codesnippet.py',
        runScript: 'PYTHONIOENCODING=utf-8 python codesnippet.py',
        compileScript: null,
        // Requests does not support multipart/form-data unless we are also
        // uploading a file. Headers are stored in a dict so we cannot have
        // two headers with same key
        skipCollections: ['formdataCollection', 'sameNameHeadersCollection', 'unsupportedMethods']
      };
    runNewmanTest(convert, options, testConfig);
  });

  describe('Run tests  for Python 3', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        fileName: 'codesnippet.py',
        runScript: 'PYTHONIOENCODING=utf-8 python3 codesnippet.py',
        compileScript: null,
        // Requests does not support multipart/form-data unless we are also
        // uploading a file. Headers are stored in a dict so we cannot have
        // two headers with same key
        skipCollections: ['formdataCollection', 'sameNameHeadersCollection', 'unsupportedMethods']
      };
    runNewmanTest(convert, options, testConfig);

  });

});


