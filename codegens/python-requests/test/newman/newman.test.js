var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4
    },
    testConfig = {
      fileName: 'codesnippet.py',
      runScript: 'python codesnippet.py',
      compileScript: null,
      skipCollections: ['formdataCollection', 'sameNameHeadersCollection']
    };
  runNewmanTest(convert, options, testConfig);

});

