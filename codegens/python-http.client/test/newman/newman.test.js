var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4,
      requestTimeout: 0,
      requestBodyTrim: false,
      addCacheHeader: false,
      followRedirect: true
    },
    testConfig = {
      fileName: 'codesnippet.py',
      runScript: 'PYTHONIOENCODING=utf-8 python3 codesnippet.py',
      skipCollections: ['redirectCollection', 'sameNameHeadersCollection', 'unsupportedMethods']
    };
  runNewmanTest(convert, options, testConfig);
});
