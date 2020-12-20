var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert,
  sanitize = require('../../lib/util').sanitize,
  getUrlStringfromUrlObject = require('../../lib/parseRequest').getUrlStringfromUrlObject,
  getOptions = require('../../index').getOptions,
  mainCollection = require('./fixtures/testcollection/collection.json');

describe('java unirest convert function for test collection', function () {
  describe('convert function', function () {
    var request,
      reqObject,
      options = {},
      snippetArray,
      indentString = '\t',
      headerSnippet,
      footerSnippet,
      line_no;

    it('should return a Tab indented snippet ', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        indentType: 'Tab',
        indentCount: 1
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }

        expect(snippet).to.be.a('string');
        snippetArray = snippet.split('\n');
        /* eslint-disable max-len */
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i] === 'HttpResponse<String> response = Unirest.get("https://postman-echo.com/headers")') {
            line_no = i + 1;
          }
        }
        /* eslint-enable max-len */
        expect(snippetArray[line_no].charAt(0)).to.equal('\t');
      });
    });

    it('should return snippet with setTimeouts function when timeout is set to non zero', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        requestTimeout: 1000
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('.setTimeouts(0, 1000)');
      });
    });

    it('should return snippet with setTimeouts function setting both ' +
            'connection and socket timeout to 0 when requestTimeout is set to 0', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        requestTimeout: 0
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('.setTimeouts(0, 0)');
      });
    });

    it('should return snippet with disableRedirectHandling function for' +
            'follow redirect option set to false', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        followRedirect: false
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('.disableRedirectHandling()');
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
        expect(snippet).to.contain('.field("json", "{\\"hello\\": \\"world\\"}", "application/json")');
      });
    });

    it('should include import statements, main class and print statements ' +
            'when includeBoilerplate is set to true', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        includeBoilerplate: true,
        indentType: 'Tab',
        indentCount: 1
      };
      headerSnippet = 'import com.mashape.unirest.http.*;\n' +
                        'import java.io.*;\n' +
                        'public class main {\n' +
                        indentString + 'public static void main(String []args) throws Exception{\n';
      footerSnippet = indentString.repeat(2) + 'System.out.println(response.getBody());\n' +
                        indentString + '}\n}\n';

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include(headerSnippet);
        expect(snippet).to.include(footerSnippet);
      });
    });

    it('should return valid code snippet for no headers and no body', function () {
      reqObject = {
        'description': 'This is a sample POST request without headers and body',
        'url': 'https://echo.getpostman.com/post',
        'method': 'POST'
      };
      request = new sdk.Request(reqObject);
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('.header');
        expect(snippet).to.not.include('.body');
        expect(snippet).to.not.include('.field');
      });
    });

    it('should replace propfind by default get method as unirest java only supports standard ' +
        'six HTTP methods', function () {
      reqObject = {
        'description': 'This is a sample PROPFIND request',
        'url': 'https://mockbin.org/request',
        'method': 'PROPFIND'
      };
      request = new sdk.Request(reqObject);
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('.propfind');
        expect(snippet).to.include('.get');
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
      convert(request, {}, function (error, snippet) {
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
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http://postman-echo.com/post?a=b%20c');
        expect(snippet).to.not.include('http://postman-echo.com/post?a=b c');
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
        expect(snippet).to.include('.header("key_containing_whitespaces", "  value_containing_whitespaces  ")');
      });
    });

    it('should add the force multipart body method when ' +
      'there are no files but contains text field params in multipart/form-data', function () {
      var request = new sdk.Request({
        'method': 'GET',
        'body': {
          'mode': 'formdata',
          'formdata': [
            {
              'key': 'key1',
              'value': 'value1',
              'type': 'text'
            },
            {
              'key': 'key2',
              'value': 'value2',
              'type': 'text'
            }
          ]
        },
        'url': {
          'raw': 'https://postman-echo/',
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
        expect(snippet).to.include('.multiPartContent()');
        expect(snippet).to.include('.field("key1", "value1")');
        expect(snippet).to.include('.field("key2", "value2")');
      });
    });

    it('should not add the force multipart body method when ' +
      'there are file fields in multipart/form-data', function () {
      var request = new sdk.Request({
        'method': 'GET',
        'body': {
          'mode': 'formdata',
          'formdata': [
            {
              'key': 'key1',
              'value': 'value1',
              'type': 'file'
            },
            {
              'key': 'key2',
              'value': 'value2',
              'type': 'text'
            }
          ]
        },
        'url': {
          'raw': 'https://postman-echo/',
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
        expect(snippet).to.not.include('.multiPartContent()');
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
        expect(snippet).to.include('.field("file", new File("/path/to/file"))');
      });
    });

    it('should generate valid snippets for single/double quotes in URL', function () {
      // url = https://a"b'c.com/'d/"e
      var request = new sdk.Request("https://a\"b'c.com/'d/\"e"); // eslint-disable-line quotes
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        // expect => Unirest.get("https://a\"b'c.com/'d/\"e")
        expect(snippet).to.include('Unirest.get("https://a\\"b\'c.com/\'d/\\"e")');
      });
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
  describe('getOptions function', function () {

    it('should return an array of specific options', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'includeBoilerplate');
      expect(getOptions()[1]).to.have.property('id', 'indentCount');
      expect(getOptions()[2]).to.have.property('id', 'indentType');
      expect(getOptions()[3]).to.have.property('id', 'requestTimeout');
      expect(getOptions()[4]).to.have.property('id', 'followRedirect');
      expect(getOptions()[5]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('sanitize function', function () {
    it('should return empty string when input is not a string type', function () {
      expect(sanitize(123, false)).to.equal('');
      expect(sanitize(null, false)).to.equal('');
      expect(sanitize({}, false)).to.equal('');
      expect(sanitize([], false)).to.equal('');
    });

    it('should trim input string when needed', function () {
      expect(sanitize('inputString     ', true)).to.equal('inputString');
    });
  });
});
