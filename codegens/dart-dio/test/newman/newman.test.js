var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;


describe('Dart-dio Converter', function () {
  describe('convert for different request types', function () {
    var options = {indentCount: 2, indentType: 'Space', includeBoilerplate: true },
      testConfig = {
        runScript: 'dart snippet.dart',
        fileName: 'snippet.dart',
        headerSnippet: '',
        // http uses Map<String, String> to store headers, so there is no way to
        // keep multiple headers with the same key
        skipCollections: ['sameNameHeadersCollection', 'unsupportedMethods']
      };
    runNewmanTest(convert, options, testConfig);
  });
});
