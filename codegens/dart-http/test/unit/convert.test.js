var convert = require('../../index').convert,
  expect = require('chai').expect,
  sdk = require('postman-collection');

// Disable check with expected snippets as we now have proper newman tests
describe('Dart Converter', function () {
  it('should add timeout if requestTimeout options is used', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [
        {
          'key': 'Content-Type',
          'value': 'application/json'
        }
      ],
      'body': {
        'mode': 'raw',
        'raw': '{\n  "json": "Test-Test"\n}'
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

    convert(request, {requestTimeout: 5000}, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('.timeout(Duration(milliseconds: 5000))');
    });
  });

  it('should use http.MultipartRequest for formdata requests', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'formdata',
        'formdata': []
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
    convert(request, {}, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('http.MultipartRequest');
    });
  });

  it('should add code for followRedirects if given in the option', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [],
      'url': {
        'raw': 'https://postman-echo.com/',
        'protocol': 'https',
        'host': [
          'postman-echo',
          'com'
        ]
      }
    });
    convert(request, { followRedirect: false }, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('request.followRedirects = false;');
    });
  });

  it('should add boilerplate if given in the option', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [],
      'url': {
        'raw': 'https://postman-echo.com/',
        'protocol': 'https',
        'host': [
          'postman-echo',
          'com'
        ]
      }
    });
    convert(request, { includeBoilerplate: true }, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('import \'package:http/http.dart\' as http;');
      expect(snippet).to.contain('void main() async {');
    });
  });

  it('should add correct indentation', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'formdata',
        'formdata': [
          {
            'key': 'hello',
            'value': 'world',
            'type': 'text'
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
    convert(request, { includeBoilerplate: true, indentType: 'Tab' }, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('\t\t\'hello\': \'world\'');
    });
  });
});
