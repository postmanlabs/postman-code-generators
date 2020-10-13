var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

  // Skipping for CI, can be run locally to check snippet generation
describe('Convert for different types of request', function () {
  var options = {indentCount: 2, indentType: 'Space', includeBoilerplate: true },
    testConfig = {
      // compileScript: 'clang -framework Foundation snippet.m -o prog',
      runScript: 'dart snippet.dart',
      fileName: 'snippet.dart',
      headerSnippet: ''
    };

  runNewmanTest(convert, options, testConfig);
});
