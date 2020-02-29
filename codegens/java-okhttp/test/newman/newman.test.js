var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('convert for different request types', function () {
  this.timeout(100000); // Mocha timeout implementation
  var options = {indentCount: 3, indentType: 'Space', includeBoilerplate: true},
    testConfig = {
      compileScript: 'javac -cp *: main.java',
      runScript: 'java -cp *: main',
      fileName: 'main.java'
    };
  runNewmanTest(convert, options, testConfig);
});
