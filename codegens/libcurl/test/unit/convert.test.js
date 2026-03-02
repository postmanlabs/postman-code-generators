var expect = require('chai').expect,
  { Request } = require('postman-collection/lib/collection/request'),
  { Url } = require('postman-collection/lib/collection/url'),
  convert = require('../../index').convert,
  getOptions = require('../../index').getOptions,
  getUrlStringfromUrlObject = require('../../lib/util').getUrlStringfromUrlObject,
  sanitize = require('../../lib/util').sanitize,
  mainCollection = require('../../../../test/codegen/newman/fixtures/basicCollection.json');

describe('libcurl convert function', function () {
  describe('convert function', function () {
    it('should throw an error if callback is not a function', function () {
      var request = null,
        options = {
          indentCount: 1,
          indentType: 'Tab',
          requestTimeout: 200,
          trimRequestBody: true
        },
        callback = null;

      expect(function () { convert(request, options, callback); }).to.throw(Error);
    });

    it('should set CURLOPT_TIMEOUT_MS parameter when requestTimeout is set to non zero value', function () {
      var request = new Request(mainCollection.item[0].request),
        options = { requestTimeout: 3000 };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, 3000L);');
      });
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
        expect(snippet).to.include('headers, "key_containing_whitespaces: ' +
        '  value_containing_whitespaces  "');
      });
    });

    it('should add content type if formdata field contains a content-type', function () {
      var request = new Request({
        'method': 'POST',
        'body': {
          'mode': 'formdata',
          'formdata': [
            {
              'key': 'json',
              'value': '{"hello": "world"}',
              'contentType': 'application/json',
              'type': 'text'
            }
          ]
        },
        'url': {
          'raw': 'http://postman-echo.com/post',
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
        expect(snippet).to.contain('curl_mime_type(part, "application/json");');
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
        expect(snippet).to.include('curl_mime_name(part, "no file");');
        expect(snippet).to.include('curl_mime_filedata(part, "/path/to/file");');
        expect(snippet).to.include('curl_mime_name(part, "no src");');
        expect(snippet).to.include('curl_mime_name(part, "invalid src");');
      });
    });

    it('should free up headers list after request is sent', function () {
      var request = new Request({
        'method': 'GET',
        'header': [
          {
            'key': 'Accept',
            'value': 'application/json'
          },
          {
            'key': 'Content-Type',
            'value': 'application/json'
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
        expect(snippet).to.include('curl_slist_free_all(headers)');
      });
    });

  });

  describe('getOptions function', function () {
    var options = getOptions();

    it('should return an array of specific options', function () {
      expect(options).to.be.an('array');
      expect(options[0]).to.have.property('id', 'includeBoilerplate');
      expect(options[1]).to.have.property('id', 'protocol');
      expect(options[2]).to.have.property('id', 'indentCount');
      expect(options[3]).to.have.property('id', 'indentType');
      expect(options[4]).to.have.property('id', 'followRedirect');
      expect(options[5]).to.have.property('id', 'trimRequestBody');
      expect(options[6]).to.have.property('id', 'useMimeType');
    });
  });

  describe('Sanitize function', function () {

    it('should return empty string when input is not a string type', function () {
      expect(sanitize(123, false)).to.equal('');
      expect(sanitize(null, false)).to.equal('');
      expect(sanitize({}, false)).to.equal('');
      expect(sanitize([], false)).to.equal('');
    });

    it('should trim input string when needed', function () {
      expect(sanitize('inputString     ', true)).to.equal('inputString');
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
});
