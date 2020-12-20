var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../index').convert;

describe('Golang convert function', function () {
  describe('Convert function', function () {
    var request, options;

    it('should return snippet without errors when request object has no body property', function () {
      request = new sdk.Request({
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
      });
      options = {
        longFormat: false
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('url := "https://google.com"');
        expect(snippet).to.include('method := "GET"');
      });
    });

    it('should parse headers with string value properly', function () {
      request = new sdk.Request({
        'method': 'POST',
        'header': [
          {
            'key': 'foo',
            'value': 'W/"1234"'
          },
          {
            'key': 'foz',
            'value': 'W/\'qw\''
          }
        ],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        indentType: 'Tab',
        indentCount: 1
      };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('req.Header.Add("foo", "W/\\"1234\\"")');
        expect(snippet).to.include('req.Header.Add("foz", "W/\'qw\'")');
      });
    });

    it('should add content type if formdata field contains a content-type', function () {
      request = new sdk.Request({
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
        expect(snippet).to.contain('mimeHeader1 := make(map[string][]string)');
        expect(snippet).to.contain('mimeHeader1["Content-Disposition"] = append(mimeHeader1["Content-Disposition"], "form-data; name=\\"json\\"")'); // eslint-disable-line max-len
        expect(snippet).to.contain('mimeHeader1["Content-Type"] = append(mimeHeader1["Content-Type"], "application/json")'); // eslint-disable-line max-len
        expect(snippet).to.contain('fieldWriter1, _ := writer.CreatePart(mimeHeader1)');
        expect(snippet).to.contain('fieldWriter1.Write([]byte("{\\"hello\\": \\"world\\"}"))');
      });
    });

    it('should add time converted to seconds when input is taken in milliseconds ', function () {
      request = new sdk.Request({
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
      });
      options = {
        requestTimeout: 3
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('timeout := time.Duration(0.003 * time.Second)');
      });
    });

    it('should trim header keys and not trim header values', function () {
      var request = new sdk.Request({
        'method': 'GET',
        'header': [
          {
            'key': '  key_containing_whitespaces  ',
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
        expect(snippet).to.include('req.Header.Add("key_containing_whitespaces", "  value_containing_whitespaces  ")');
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
        expect(snippet).to.include('writer.CreateFormFile("no file",filepath.Base("/path/to/file"))');
        expect(snippet).to.include('writer.CreateFormFile("no src",filepath.Base("/path/to/file"))');
        expect(snippet).to.include('writer.CreateFormFile("invalid src",filepath.Base("/path/to/file"))');
      });
    });

    it('should add error handling code everytime an error is possible', function () {
      var requests = [];
      requests.push(new sdk.Request({
        'method': 'GET',
        'header': [
          {
            'key': 'foo',
            'value': 'bar'
          }
        ],
        'url': {
          'raw': 'https://example.com',
          'protocol': 'http',
          'host': [
            'example',
            'com'
          ]
        }
      }));
      requests.push(new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': 'hello world'
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
      }));
      requests.forEach(function (request) {
        convert(request, {}, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet.match('err := ').length).to.be.equal(snippet.match('if err != nil {').length);
        });
      });
    });
  });
});
