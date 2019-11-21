var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert;

describe('Ruby converter', function () {
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
      expect(snippet).to.include('request["key_containing_whitespaces"] = "  value_containing_whitespaces  "');
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
      expect(snippet).to.include('[\'no file\', File.open(\'/path/to/file\')]');
      expect(snippet).to.include('[\'no src\', File.open(\'/path/to/file\')]');
      expect(snippet).to.include('[\'invalid src\', File.open(\'/path/to/file\')]');
    });
  });

});
