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
        headerSnippet: 'printf \'\' | ',
        skipCollections: ['formdataCollection', 'sameNameHeadersCollection', 'emptyFormdataCollection']
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
      expect(snippet).to.include('GET \'https://localhost:3000/getSelfBody\'');
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

  it('should generate snippets for no files in form data', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'formdata',
        'formdata': [
          {
            'key': 'no file',
            'value': '',
            'type': 'file',
            'src': []
          },
          {
            'key': 'no src',
            'value': '',
            'type': 'file'
          },
          {
            'key': 'invalid src',
            'value': '',
            'type': 'file',
            'src': {}
          }
        ]
      },
      'url': {
        'raw': 'https://postman-echo.com/post',
        'protocol': 'https',
        'host': [
          'postman-echo',
          'com'
        ],
        'path': [
          'post'
        ]
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('\'no file\'@/path/to/file');
      expect(snippet).to.include('\'no src\'@/path/to/file');
      expect(snippet).to.include('\'invalid src\'@/path/to/file');
    });
  });

  it('should generate valid snippet and should include appropriate variable name', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [],
      'body': {},
      'url': 'https://postman-echo.com/:action'
    });

    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include(':action');
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
