var _ = require('lodash'),
  expect = require('chai').expect,
  { Request } = require('postman-collection/lib/collection/request'),
  { Url } = require('postman-collection/lib/collection/url'),
  convert = require('../../index').convert,
  getUrlStringfromUrlObject = require('../../lib/util').getUrlStringfromUrlObject;

describe('postman-cli convert function', function () {
  describe('Convert function', function () {
    var request, options, snippetArray, line;

    it('should return snippet with carat(^) as line continuation ' +
            'character for multiline code generation', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        multiLine: true,
        lineContinuationCharacter: '^'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        snippetArray = snippet.split('\n');
        // Ignoring the last line as there is no line continuation character at last line
        for (var i = 0; i < snippetArray.length - 1; i++) {
          line = snippetArray[i];
          expect(line.charAt(line.length - 1)).to.equal('^');
        }
      });
    });

    it('should return snippet with url in single quote(\')', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
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
      options = {
        quoteType: 'single'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.contain('\'https://postman-echo.com/post\'');
      });
    });

    it('should return snippet with url in double quote(")', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
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
      options = {
        quoteType: 'double'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.contain('"https://postman-echo.com/post"');
      });
    });

    it('should add colon after header key, if the value is empty string', function () {
      request = new Request({
        'method': 'GET',
        'header': [
          {
            'key': 'hello',
            'value': ''
          }
        ],
        'url': {
          'raw': 'https://postman-echo.com/get',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'get'
          ]
        }
      });
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.contain('--header \'hello: \'');
      });
    });

    it('should return snippet with backslash(\\) as line continuation ' +
            'character for multiline code generation by default', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        multiLine: true
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        snippetArray = snippet.split('\n');
        // Ignoring the last line as there is no line continuation character at last line
        for (var i = 0; i < snippetArray.length - 1; i++) {
          line = snippetArray[i];
          expect(line.charAt(line.length - 1)).to.equal('\\');
        }
      });
    });

    it('should return snippet with backtick(`) as line continuation ' +
            'character for multiline code generation', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        multiLine: true,
        lineContinuationCharacter: '`'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        snippetArray = snippet.split('\n');
        // Ignoring the last line as there is no line continuation character at last line
        for (var i = 0; i < snippetArray.length - 1; i++) {
          line = snippetArray[i];
          expect(line.charAt(line.length - 1)).to.equal('`');
        }
      });
    });

    it('should add content type if formdata field contains a content-type', function () {
      request = new Request({
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
        expect(snippet).to.contain('--form');
        expect(snippet).to.contain('json=');
      });
    });

    it('should parse header with string value properly', function () {
      request = new Request({
        'method': 'POST',
        'header': [
          {
            'key': 'foo',
            'value': '"bar"'
          }
        ],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        longFormat: false
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.include("-H 'foo: \"bar\"'"); // eslint-disable-line quotes
      });
    });

    it('should return snippet without errors when request object has no body property', function () {
      request = new Request({
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
        expect(snippet).to.include("'https://google.com'"); // eslint-disable-line quotes
      });
    });

    it('should return snippet with JSON body in single line if multiline option is false', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': '{\n  "name": "John",\n  "type": "names",\n  "id": "123sdaw"\n}',
          'options': {
            'raw': {
              'language': 'json'
            }
          }
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
      options = {
        multiLine: false,
        longFormat: false,
        lineContinuationCharacter: '\\',
        quoteType: 'single',
        requestTimeoutInSeconds: 0,
        followRedirect: true,
        followOriginalHttpMethod: false
      };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.contain('-d \'{"name":"John","type":"names","id":"123sdaw"}\'');
      });
    });

    it('should return snippet with backslash(\\) character as line continuation ' +
         'character for multiline code generation', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        multiLine: true,
        lineContinuationCharacter: '\\'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        snippetArray = snippet.split('\n');
        // Ignoring the last line as there is no line continuation character at last line
        for (var i = 0; i < snippetArray.length - 1; i++) {
          line = snippetArray[i];
          expect(line.charAt(line.length - 1)).to.equal('\\');
        }
      });
    });

    it('should not encode queryParam unresolved variables and ' +
    'leave it inside double parenthesis {{xyz}}', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'url': {
          'raw': 'http://postman-echo.com/post?a={{xyz}}',
          'protocol': 'http',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'post'
          ],
          'query': [
            {
              'key': 'a',
              'value': '{{xyz}}'
            }
          ]
        }
      });
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http://postman-echo.com/post?a={{xyz}}');
        expect(snippet).to.not.include('http://postman-echo.com/post?a=%7B%7Bxyz%7D%7D');
      });
    });

    it('should encode queryParams other than unresolved variables', function () {
      request = new Request({
        'method': 'POST',
        'header': [],
        'url': {
          'raw': 'http://postman-echo.com/post?a=b c',
          'protocol': 'http',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'post'
          ],
          'query': [
            {
              'key': 'a',
              'value': 'b c'
            }
          ]
        }
      });
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http://postman-echo.com/post?a=b%20c');
        expect(snippet).to.not.include('http://postman-echo.com/post?a=b c');
      });
    });

    it('should trim header keys and not trim header values', function () {
      var request = new Request({
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
      convert(request, { longFormat: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        // one extra space in matching the output because we add key:<space>value in the snippet
        expect(snippet).to.include(
          `--header 'key_containing_whitespaces:   value_containing_whitespaces  '`); // eslint-disable-line quotes
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
        expect(snippet).to.include('\'no file=@"/path/to/file"\'');
        expect(snippet).to.include('\'no src=@"/path/to/file"\'');
        expect(snippet).to.include('\'invalid src=@"/path/to/file"\'');
      });
    });

    it('should generate valid snippets for single/double quotes in URL', function () {
      // url = https://a"b'c.com/'d/"e
      var request = new Request("https://a\"b'c.com/'d/\"e"); // eslint-disable-line quotes
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        // for single quote escaping inside single quotes involves changing of ' to '\''
        // expect => 'https://a"b'\''c.com/'\''d/"e'
        expect(snippet).to.include("'https://a\"b'\\''c.com/'\\''d/\"e'"); // eslint-disable-line quotes
      });
    });

    it('should generate valid snippets when quoteType is "double"', function () {
      // url = https://a"b'c.com/'d/"e
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
          'raw': "https://a\"b'c.com/'d/\"e", // eslint-disable-line quotes
          'host': [
            'a"b\'c',
            'com'
          ]
        }
      });
      convert(request, {quoteType: 'double'}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.include('"a\\"b\'c.com"');
        expect(snippet).to.include('"json=');
      });
    });

    it('should add appropriate escaping characters when quote type is "double"', function () {
      var request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': '{"query":"test"}',
          'options': {
            'raw': {
              'language': 'json'
            }
          }
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
      convert(request, { quoteType: 'double', longFormat: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.include('--body');
        expect(snippet).to.include('query');
      });
    });

    it('should escape special characters when quoteType is "double"', function () {
      var request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': '{\r\n    "hello": "$(whoami)"\r\n}',
          'options': {
            'raw': {
              'language': 'json'
            }
          }
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
      // eslint-disable-next-line max-len
      convert(request, { quoteType: 'double', lineContinuationCharacter: '^', longFormat: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.include('--body');
        expect(snippet).to.include('hello');
      });
    });

    describe('getUrlStringfromUrlObject function', function () {
      var rawUrl, urlObject, outputUrlString;

      it('should return empty string for an url object for an empty url or if no url object is passed', function () {
        rawUrl = '';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.be.empty;
        outputUrlString = getUrlStringfromUrlObject();
        expect(outputUrlString).to.be.empty;
      });

      it('should add protocol if present in the url object', function () {
        rawUrl = 'https://postman-echo.com';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should add the auth information if present in the url object', function () {
        rawUrl = 'https://user:password@postman-echo.com';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should not add the auth information if user isn\'t present but' +
      ' password is present in the url object', function () {
        rawUrl = 'https://:password@postman-echo.com';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.not.include(':password');
      });

      it('should add host if present in the url object', function () {
        rawUrl = 'https://postman-echo.com';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should add port if present in the url object', function () {
        rawUrl = 'https://postman-echo.com:8080';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should add path if present in the url object', function () {
        rawUrl = 'https://postman-echo.com/get';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      describe('queryParams', function () {

        it('should not encode unresolved query params', function () {
          rawUrl = 'https://postman-echo.com/get?key={{value}}';
          urlObject = new Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.not.include('key=%7B%7Bvalue%7B%7B');
          expect(outputUrlString).to.equal(rawUrl);
        });

        it('should encode query params other than unresolved variables', function () {
          rawUrl = 'https://postman-echo.com/get?key=\'a b c\'';
          urlObject = new Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.not.include('key=\'a b c\'');
          expect(outputUrlString).to.equal('https://postman-echo.com/get?key=%27a%20b%20c%27');
        });

        it('should not encode unresolved query params and ' +
        'encode every other query param, both present together', function () {
          rawUrl = 'https://postman-echo.com/get?key1={{value}}&key2=\'a b+c\'';
          urlObject = new Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.not.include('key1=%7B%7Bvalue%7B%7B');
          expect(outputUrlString).to.not.include('key2=\'a b+c\'');
          expect(outputUrlString).to.equal('https://postman-echo.com/get?key1={{value}}&key2=%27a%20b+c%27');
        });

        it('should not encode query params that are already encoded', function () {
          rawUrl = 'https://postman-echo.com/get?query=urn%3Ali%3Afoo%3A62324';
          urlObject = new Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.equal('https://postman-echo.com/get?query=urn%3Ali%3Afoo%3A62324');
        });

        it('should discard disabled query params', function () {
          urlObject = new Url({
            protocol: 'https',
            host: 'postman-echo.com',
            query: [
              { key: 'foo', value: 'bar' },
              { key: 'alpha', value: 'beta', disabled: true }
            ]
          });
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.equal('https://postman-echo.com?foo=bar');
        });
      });

      it('should add hash if present in the url object', function () {
        rawUrl = 'https://postmanm-echo.com/get#hash';
        urlObject = new Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });
    });

    it('should always add HTTP method in POST request', function () {
      var request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'graphql',
          'graphql': {
            'query': '{\n  findScenes(\n    filter: {per_page: 0}\n    scene_filter: {is_missing: "performers"}){\n    count\n    scenes {\n      id\n      title\n      path\n    }\n  }\n}', // eslint-disable-line
            'variables': '{\n\t"variable_key": "variable_value"\n}'
          }
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

      convert(request, { followRedirect: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.match(/^postman request POST /);
      });
    });

    it('should add HTTP method in POST request even if body is not present', function () {
      var request = new Request({
        'method': 'POST',
        'header': [],
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

      convert(request, { followRedirect: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.match(/^postman request POST /);
      });
    });

    it('should not add HTTP method in GET request', function () {
      var request = new Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'https://postman-echo.com/get',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'get'
          ]
        }
      });

      convert(request, { followRedirect: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.match(/^postman request '/);
        expect(snippet).to.not.match(/^postman request GET /);
      });
    });

    describe('followRedirect and followOriginalHttpMethod', function () {
      it('should add --redirect-follow-method flag when followOriginalHttpMethod is true', function () {
        const request = new Request({
          'method': 'POST',
          'header': [],
          'body': {
            'mode': 'graphql',
            'graphql': {
                'query': '{\n  findScenes(\n    filter: {per_page: 0}\n    scene_filter: {is_missing: "performers"}){\n    count\n    scenes {\n      id\n      title\n      path\n    }\n  }\n}', // eslint-disable-line
              'variables': '{\n\t"variable_key": "variable_value"\n}'
            }
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

        convert(request, { followRedirect: true, followOriginalHttpMethod: true }, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.match(/^postman request POST /);
          expect(snippet).to.include('--redirects-follow-method');
        });
      });

      it('should add --redirects-ignore flag when followRedirect is false', function () {
        const request = new Request({
          'method': 'POST',
          'header': [],
          'body': {
            'mode': 'graphql',
            'graphql': {
                'query': '{\n  findScenes(\n    filter: {per_page: 0}\n    scene_filter: {is_missing: "performers"}){\n    count\n    scenes {\n      id\n      title\n      path\n    }\n  }\n}', // eslint-disable-line
              'variables': '{\n\t"variable_key": "variable_value"\n}'
            }
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

        convert(request, { followRedirect: false, followOriginalHttpMethod: false }, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--redirects-ignore');
          expect(snippet).to.not.include('--redirects-follow-method');
        });
      });

      it('should not add --redirects-ignore when followRedirect is true', function () {
        const request = new Request({
          'method': 'POST',
          'header': [],
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

        convert(request, { followRedirect: true, followOriginalHttpMethod: false }, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.not.include('--redirects-ignore');
        });
      });

      it('should add --max-redirects flag when maxRedirects is set', function () {
        const request = new Request({
          'method': 'POST',
          'header': [],
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

        convert(request, { followRedirect: true, maxRedirects: 5 }, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--redirects-max 5');
        });
      });
    });

    describe('should correctly handle NTLM auth', function () {
      const sampleRequest = {
        'method': 'POST',
        'header': [],
        'auth': {
          'type': 'ntlm',
          'ntlm': []
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
      };

      it('when no username or password is present', function () {
        const request = new Request(sampleRequest);

        convert(request, {}, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.not.include('--auth-ntlm-username');
          expect(snippet).to.not.include('--auth-ntlm-password');
        });
      });

      it('when empty username and password is present', function () {
        const request = new Request(Object.assign({ auth: {
          'type': 'ntlm',
          'ntlm': [
            {key: 'username', value: ''},
            {key: 'password', value: ''}
          ]
        }}, sampleRequest));

        convert(request, {}, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.not.include('--auth-ntlm-username');
          expect(snippet).to.not.include('--auth-ntlm-password');
        });
      });

      it('when correct username and password is present with single quotes as option', function () {
        const request = new Request(_.set(sampleRequest, 'auth.ntlm', [
          {key: 'username', value: 'joh\'n'},
          {key: 'password', value: 'tennesse"e'}
        ]));

        convert(request, { quoteType: 'single' }, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--auth-ntlm-username \'joh\'\\\'\'n\'');
          expect(snippet).to.include('--auth-ntlm-password \'tennesse"e\'');
        });
      });

      it('when correct username and password is present with double as option', function () {
        const request = new Request(_.set(sampleRequest, 'auth.ntlm', [
          {key: 'username', value: 'joh\'n'},
          {key: 'password', value: 'tennesse"e'}
        ]));

        convert(request, { quoteType: 'double' }, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--auth-ntlm-username "joh\'n"');
          expect(snippet).to.include('--auth-ntlm-password "tennesse\\"e"');
        });
      });

      it('when username and password is present with domain as well', function () {
        const request = new Request(_.set(sampleRequest, 'auth.ntlm', [
          {key: 'username', value: 'joh\'n'},
          {key: 'password', value: 'tennesse"e'},
          {key: 'domain', value: 'radio'}
        ]));

        convert(request, {}, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--auth-ntlm-username \'joh\'\\\'\'n\'');
          expect(snippet).to.include('--auth-ntlm-password \'tennesse"e\'');
          expect(snippet).to.include('--auth-ntlm-domain \'radio\'');
        });
      });
    });

    it('should use --body when request body type is file', function () {
      var request = new Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'file',
          'file': {
            'src': 'file-path/collection123.json'
          }
        },
        'url': {
          'raw': 'https://postman-echo.com/get',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'get'
          ]
        }
      });

      convert(request, { longFormat: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('--body \'@file-path/collection123.json\'');
      });
    });

    describe('indentType option', function () {
      it('should use spaces for indentation when indentType is "Space"', function () {
        request = new Request({
          'method': 'POST',
          'header': [
            {
              'key': 'Content-Type',
              'value': 'application/json'
            }
          ],
          'body': {
            'mode': 'raw',
            'raw': '{"test": "data"}'
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
        options = {
          multiLine: true,
          indentType: 'Space',
          indentCount: 2,
          lineContinuationCharacter: '\\'
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          // Check that lines are indented with spaces (the pattern should be: space + backslash + newline + spaces)
          snippetArray = snippet.split('\n');
          // Second line onwards should have space indentation
          for (var i = 1; i < snippetArray.length; i++) {
            line = snippetArray[i];
            if (line.length > 0) {
              // Line should start with spaces (indentCount = 2)
              expect(line).to.match(/^ {2}/);
            }
          }
        });
      });

      it('should use tabs for indentation when indentType is "Tab"', function () {
        request = new Request({
          'method': 'POST',
          'header': [
            {
              'key': 'Content-Type',
              'value': 'application/json'
            }
          ],
          'body': {
            'mode': 'raw',
            'raw': '{"test": "data"}'
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
        options = {
          multiLine: true,
          indentType: 'Tab',
          indentCount: 1,
          lineContinuationCharacter: '\\'
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          // Check that lines are indented with tabs
          snippetArray = snippet.split('\n');
          // Second line onwards should have tab indentation
          for (var i = 1; i < snippetArray.length; i++) {
            line = snippetArray[i];
            if (line.length > 0) {
              // Line should start with tab character
              expect(line).to.match(/^\t/);
            }
          }
        });
      });

      it('should respect indentCount when using Space indentation', function () {
        request = new Request({
          'method': 'POST',
          'header': [
            {
              'key': 'X-Custom-Header',
              'value': 'test'
            }
          ],
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
        options = {
          multiLine: true,
          indentType: 'Space',
          indentCount: 4,
          lineContinuationCharacter: '\\'
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          snippetArray = snippet.split('\n');
          // Second line onwards should have 4 spaces indentation
          for (var i = 1; i < snippetArray.length; i++) {
            line = snippetArray[i];
            if (line.length > 0) {
              expect(line).to.match(/^ {4}/);
            }
          }
        });
      });

      it('should use Space indentation by default', function () {
        request = new Request({
          'method': 'POST',
          'header': [
            {
              'key': 'Content-Type',
              'value': 'application/json'
            }
          ],
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
        options = {
          multiLine: true,
          lineContinuationCharacter: '\\'
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          snippetArray = snippet.split('\n');
          // Should use spaces by default (2 spaces based on default indentCount)
          for (var i = 1; i < snippetArray.length; i++) {
            line = snippetArray[i];
            if (line.length > 0) {
              expect(line).to.match(/^ {2}/);
              expect(line).to.not.match(/^\t/);
            }
          }
        });
      });
    });

    describe('debug option', function () {
      it('should add --debug flag when debug option is true', function () {
        request = new Request({
          'method': 'GET',
          'header': [],
          'url': {
            'raw': 'https://postman-echo.com/get',
            'protocol': 'https',
            'host': [
              'postman-echo',
              'com'
            ],
            'path': [
              'get'
            ]
          }
        });
        options = {
          debug: true
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--debug');
        });
      });

      it('should not add --debug flag when debug option is false', function () {
        request = new Request({
          'method': 'GET',
          'header': [],
          'url': {
            'raw': 'https://postman-echo.com/get',
            'protocol': 'https',
            'host': [
              'postman-echo',
              'com'
            ],
            'path': [
              'get'
            ]
          }
        });
        options = {
          debug: false
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.not.include('--debug');
        });
      });

      it('should not add --debug flag by default', function () {
        request = new Request({
          'method': 'GET',
          'header': [],
          'url': {
            'raw': 'https://postman-echo.com/get',
            'protocol': 'https',
            'host': [
              'postman-echo',
              'com'
            ],
            'path': [
              'get'
            ]
          }
        });
        options = {};
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.not.include('--debug');
        });
      });

      it('should add --debug flag with multiline format', function () {
        request = new Request({
          'method': 'POST',
          'header': [
            {
              'key': 'Content-Type',
              'value': 'application/json'
            }
          ],
          'body': {
            'mode': 'raw',
            'raw': '{"test": "data"}'
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
        options = {
          debug: true,
          multiLine: true,
          longFormat: true
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--debug');
          // Verify it appears on its own line in multiline format
          snippetArray = snippet.split('\n');
          var foundDebug = false;
          for (var i = 0; i < snippetArray.length; i++) {
            if (snippetArray[i].includes('--debug')) {
              foundDebug = true;
              break;
            }
          }
          expect(foundDebug).to.be.true;
        });
      });

      it('should work with both quiet and debug flags together', function () {
        request = new Request({
          'method': 'GET',
          'header': [],
          'url': {
            'raw': 'https://postman-echo.com/get',
            'protocol': 'https',
            'host': [
              'postman-echo',
              'com'
            ],
            'path': [
              'get'
            ]
          }
        });
        options = {
          quiet: true,
          debug: true,
          longFormat: true
        };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
          }
          expect(snippet).to.be.a('string');
          expect(snippet).to.include('--quiet');
          expect(snippet).to.include('--debug');
        });
      });
    });
  });
});
