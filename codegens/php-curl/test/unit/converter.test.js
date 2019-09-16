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

  it('should trim header keys and not trim header values', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [
        {
          'key': '   key_containing_whitespaces  ',
          'value': '  value_containing_whitespaces  '
        }
      ],
      'url': {
        'raw': 'https://google.com',
        'protocol': 'https',
        'host': [
          'google',
          'com'
        ]
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      // one extra space in matching the output because we add key:<space>value in the snippet
      expect(snippet).to.include('"key_containing_whitespaces:   value_containing_whitespaces  "');
    });
  });

});
