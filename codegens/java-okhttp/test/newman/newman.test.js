var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe.skip('convert for different request types', function () {
  var options = {indentCount: 3, indentType: 'Space', includeBoilerplate: true},
    testConfig = {
      compileScript: 'javac -cp *: Main.java',
      runScript: 'java -cp *: Main',
      fileName: 'Main.java',
      skipCollections: ['redirectCollection']
    };
  runNewmanTest(convert, options, testConfig);
});
