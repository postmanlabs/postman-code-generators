var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('convert for different request types', function () {
  this.timeout(2 * 60000); // extending timeout to 2 minutes for java okhttp redirect tests
  var options = {indentCount: 3, indentType: 'Space', includeBoilerplate: true},
    testConfig = {
      compileScript: 'javac -cp *: main.java',
      runScript: 'java -cp *: main',
      fileName: 'main.java'
    };
  runNewmanTest(convert, options, testConfig);
});
