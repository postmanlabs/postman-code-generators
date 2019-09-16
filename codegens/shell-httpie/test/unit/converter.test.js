var expect = require('chai').expect,
  sdk = require('postman-collection'),
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert,
  sanitize = require('../../lib/util/sanitize').quote;

describe('Shell-Httpie convert function', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      testConfig = {
        headerSnippet: 'printf \'\' | '
      };
    runNewmanTest(convert, options, testConfig);
  });

  it('should add a timeout of 1 hour (3600 seconds) for RequestTimeout set to 0', function () {
    var request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'https://google.com',
          'protocol': 'https',
          'host': [
            'google',
            'com'
          ]
        }
      }),
      options = {
        requestTimeout: 0
      };
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('--timeout 3600');
    });
  });

  it('should add port in the url when host has port specified', function () {
    var request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'https://localhost:3000/getSelfBody',
          'protocol': 'https',
          'host': [
            'localhost'
          ],
          'port': '3000',
          'path': [
            'getSelfBody'
          ]
        }
      }),
      options = {};
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('GET localhost:3000/getSelfBody');
    });
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
      expect(snippet).to.include('key_containing_whitespaces:\'  value_containing_whitespaces  \'');
    });
  });
});

describe('Sanitize function', function () {
  it('should return empty string when input is not a string type', function () {
    expect(sanitize(123)).to.equal('');
    expect(sanitize(null)).to.equal('');
    expect(sanitize({})).to.equal('');
    expect(sanitize([])).to.equal('');
  });
});
