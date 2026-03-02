var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4
    },
    testConfig = {
      fileName: 'codesnippet.rb',
      runScript: 'ruby codesnippet.rb',
      compileScript: null,
      skipCollections: ['redirectCollection', 'unsupportedMethods']
    };

  runNewmanTest(convert, options, testConfig);
});
