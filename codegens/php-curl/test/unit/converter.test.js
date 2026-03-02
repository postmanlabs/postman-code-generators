var expect = require('chai').expect,
  { Request } = require('postman-collection/lib/collection/request'),
  { Url } = require('postman-collection/lib/collection/url'),
  convert = require('../../lib/index').convert,
  getUrlStringfromUrlObject = require('../../lib/util/sanitize').getUrlStringfromUrlObject;

describe('php-curl converter', function () {
  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Curl~convert: Callback is not a function');
  });

  it('should trim header keys and not trim header values', function () {
    var request = new Request({
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
      expect(snippet).to.include('\'key_containing_whitespaces:   value_containing_whitespaces  \'');
    });
  });

  it('should generate snippets for no files in form data', function () {
    var request = new Request({
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
      expect(snippet).to.include('\'no file\'=> new CURLFILE(\'/path/to/file\')');
      expect(snippet).to.include('\'no src\'=> new CURLFILE(\'/path/to/file\')');
      expect(snippet).to.include('\'invalid src\'=> new CURLFILE(\'/path/to/file\')');
    });
  });

  it('should not encode unresolved query params and ' +
  'encode every other query param, both present together', function () {
    let rawUrl = 'https://postman-echo.com/get?key1={{value}}&key2=\'a b+c\'',
      urlObject = new Url(rawUrl),
      outputUrlString = getUrlStringfromUrlObject(urlObject);
    expect(outputUrlString).to.not.include('key1=%7B%7Bvalue%7B%7B');
    expect(outputUrlString).to.not.include('key2=\'a b+c\'');
    expect(outputUrlString).to.equal('https://postman-echo.com/get?key1={{value}}&key2=%27a%20b+c%27');
  });
});
