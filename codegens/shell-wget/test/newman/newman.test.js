var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  var options = {
      indentType: 'Space',
      indentCount: 2
    },
    testConfig = {
      footerSnippet: ' -qO-', // Added this to get the response in stdout instead of saving in file.
      skipCollections: ['formdataCollection', 'sameNameHeadersCollection', 'formdataFileCollection',
        'unsupportedMethods']
    };
  runNewmanTest(convert, options, testConfig);
});
