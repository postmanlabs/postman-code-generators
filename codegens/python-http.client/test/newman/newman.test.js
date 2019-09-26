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
      fileName: 'test/unit/fixtures/codesnippet.py',
      runScript: 'python3 test/unit/fixtures/codesnippet.py',
      skipCollections: ['redirectCollection']
    };
  runNewmanTest(convert, options, testConfig);
});
