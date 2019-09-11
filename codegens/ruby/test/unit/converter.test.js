var expect = require('chai').expect,
  sdk = require('postman-collection'),
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Ruby converter', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4
    },
    testConfig = {
      fileName: 'test/unit/fixtures/codesnippet.rb',
      runScript: 'ruby test/unit/fixtures/codesnippet.rb',
      compileScript: null
    };

  runNewmanTest(convert, options, testConfig);

  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Ruby~convert: Callback is not a function');
  });

  it('should set read_timeout when requestTimeout is set to non zero value', function () {
    var request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'http://google.com',
          'protocol': 'http',
          'host': [
            'google',
            'com'
          ]
        }
      }),
      options = {requestTimeout: 3000};
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('http.read_timeout = 3');
    });
  });

});
