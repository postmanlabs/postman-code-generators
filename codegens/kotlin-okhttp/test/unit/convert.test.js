var expect = require('chai').expect,
  sdk = require('postman-collection'),
  sanitize = require('../../lib/util').sanitize,
  convert = require('../../lib/index').convert,
  getOptions = require('../../lib/index').getOptions,
  mainCollection = require('../../../../test/codegen/newman/fixtures/basicCollection.json');

describe('okhttp convert function', function () {
  describe('convert function', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      snippetArray,
      options = {
        includeBoilerplate: true,
        indentType: 'Tab',
        indentCount: 2
      };

    const SINGLE_SPACE = ' ';

    it('should generate snippet with default options given no options', function () {
      convert(request, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('public class main {')) {
            expect(snippetArray[i + 1].substr(0, 4)).to.equal(SINGLE_SPACE.repeat(4));
            expect(snippetArray[i + 1].charAt(4)).to.not.equal(SINGLE_SPACE);
          }
        }
      });
    });

    it('should return snippet with boilerplate code given option', function () {
      convert(request, { includeBoilerplate: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('import java.io.*;\nimport okhttp3.*;\npublic class main {\n');
      });
    });

    it('should return snippet with requestTimeout given option', function () {
      convert(request, { requestTimeout: 1000 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('.setConnectTimeout(1000, TimeUnit.MILLISECONDS)');
      });
    });

    it('should return snippet without followRedirect given option', function () {
      convert(request, { followRedirect: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.not.include('.followRedirects(false)');
      });
    });

    it('should generate snippet with Tab as an indent type with exact indent count', function () {
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('public class main {')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal('\t');
            expect(snippetArray[i + 1].charAt(1)).to.equal('\t');
            expect(snippetArray[i + 1].charAt(2)).to.not.equal('\t');
          }
        }
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
        expect(snippet).to.include('.addHeader("key_containing_whitespaces", "  value_containing_whitespaces  ")');
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
        expect(snippet).to.contain('RequestBody.create(MediaType.parse("application/json"), "{\\"hello\\": \\"world\\"}".getBytes()))'); // eslint-disable-line max-len
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
        expect(snippet).to.include('"no file","file"');
        expect(snippet).to.include('"no src","file"');
        expect(snippet).to.include('"invalid src","file"');
        expect(snippet).to.include('new File("/path/to/file")');
      });
    });
  });

  describe('getOptions function', function () {
    it('should return array of options for csharp-restsharp converter', function () {
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
    it('should handle invalid parameters', function () {
      expect(sanitize(123, false)).to.equal('');
      expect(sanitize(' inputString', true)).to.equal('inputString');
    });
  });
});
