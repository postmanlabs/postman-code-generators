var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

// Skipping for CI, can be run locally to check snippet generation
describe.skip('Convert for different types of request', function () {
  var options = {indentCount: 2, indentType: 'Space', includeBoilerplate: true },
    testConfig = {
      compileScript: 'clang -framework Foundation snippet.m -o prog',
      runScript: './prog',
      fileName: 'snippet.m',
      headerSnippet: ''
    };

  runNewmanTest(convert, options, testConfig);
});
