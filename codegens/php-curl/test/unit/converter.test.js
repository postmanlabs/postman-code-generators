var expect = require('chai').expect,
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('php-curl converter', function () {
  var testConfig = {
      runScript: 'php test/unit/fixtures/codesnippet.php',
      fileName: 'test/unit/fixtures/codesnippet.php',
      compileScript: null
    },
    options = {
      indentType: 'Space',
      indentCount: 4
    };

  runNewmanTest(convert, options, testConfig);

  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Curl~convert: Callback is not a function');
  });

});
