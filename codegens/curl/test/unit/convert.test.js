var expect = require('chai').expect,
  sdk = require('postman-collection'),
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert,
  getUrlStringfromUrlObject = require('../../lib/util').getUrlStringfromUrlObject;

describe('curl convert function', function () {
  describe('convert for different request types', function () {
    var testConfig = {compileScript: null, runScript: null, fileName: null},
      options = {
        indentCount: 3,
        indentType: 'Space',
        requestTimeout: 200,
        multiLine: true,
        followRedirect: true,
        longFormat: true,
        silent: true,
        lineContinuationCharacter: '\\'
      };

    runNewmanTest(convert, options, testConfig);
  });

  describe('Convert function', function () {
    var request, options, snippetArray, line;

    it('should return snippet with carat(^) as line continuation ' +
            'character for multiline code generation', function () {
      request = new sdk.Request({
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

    it('should parse header with string value properly', function () {
      request = new sdk.Request({
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
        expect(snippet).to.include('-H "foo: \\\"bar\\\""'); // eslint-disable-line no-useless-escape
      });
    });

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
        expect(snippet).to.include('GET "https://google.com"');
      });
    });

    it('should return snippet with backslash(\\) character as line continuation ' +
         'character for multiline code generation', function () {
      request = new sdk.Request({
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
      request = new sdk.Request({
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
      request = new sdk.Request({
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

    describe('getUrlStringfromUrlObject function', function () {
      var rawUrl, urlObject, outputUrlString;

      it('should return empty string for an url object for an empty url or if no url object is passed', function () {
        rawUrl = '';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.be.empty;
        outputUrlString = getUrlStringfromUrlObject();
        expect(outputUrlString).to.be.empty;
      });

      it('should add protocol if present in the url object', function () {
        rawUrl = 'https://postman-echo.com';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should add the auth information if present in the url object', function () {
        rawUrl = 'https://user:password@postman-echo.com';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should not add the auth information if user isn\'t present but' +
      ' password is present in the url object', function () {
        rawUrl = 'https://:password@postman-echo.com';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.not.include(':password');
      });

      it('should add host if present in the url object', function () {
        rawUrl = 'https://postman-echo.com';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should add port if present in the url object', function () {
        rawUrl = 'https://postman-echo.com:8080';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should add path if present in the url object', function () {
        rawUrl = 'https://postman-echo.com/get';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });

      describe('queryParams', function () {

        it('should not encode unresolved query params', function () {
          rawUrl = 'https://postman-echo.com/get?key={{value}}';
          urlObject = new sdk.Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.not.include('key=%7B%7Bvalue%7B%7B');
          expect(outputUrlString).to.equal(rawUrl);
        });

        it('should encode query params other than unresolved variables', function () {
          rawUrl = 'https://postman-echo.com/get?key=\'a b c\'';
          urlObject = new sdk.Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.not.include('key=\'a b c\'');
          expect(outputUrlString).to.equal('https://postman-echo.com/get?key=%27a%20b%20c%27');
        });

        it('should not encode unresolved query params and ' +
        'encode every other query param, both present together', function () {
          rawUrl = 'https://postman-echo.com/get?key1={{value}}&key2=\'a b c\'';
          urlObject = new sdk.Url(rawUrl);
          outputUrlString = getUrlStringfromUrlObject(urlObject);
          expect(outputUrlString).to.not.include('key1=%7B%7Bvalue%7B%7B');
          expect(outputUrlString).to.not.include('key2=\'a b c\'');
          expect(outputUrlString).to.equal('https://postman-echo.com/get?key1={{value}}&key2=%27a%20b%20c%27');
        });

        it('should discard disabled query params', function () {
          urlObject = new sdk.Url({
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
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal(rawUrl);
      });
    });
  });
});
