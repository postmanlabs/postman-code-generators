var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json'),
  testCollection = require('./fixtures/testcollection/collectionForEdge.json'),
  // getOptions = require('../../lib/index').getOptions,
  testResponse = require('./fixtures/testresponse.json');
// sanitize = require('../../lib/util').sanitize,
// csharpify = require('../../lib/util').csharpify;

describe('csharp httpclient function', function () {

  describe('csharp-httpclient convert function', function () {
    it('should return expected snippet', function () {
      var request = new sdk.Request(mainCollection.item[10].request),
        options = {
          indentCount: 1,
          indentType: 'Tab'
        };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).deep.equal(testResponse.result);
      });
    });
  });

  describe('convert function', function () {
    var request = new sdk.Request(testCollection.item[0].request),
      snippetArray,
      options = {
        includeBoilerplate: true,
        indentType: 'Space',
        indentCount: 2
      };

    it('should return snippet with boilerplate code given option', function () {
      convert(request, { includeBoilerplate: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('using System;\nusing System.Net.Http;\nusing System.Threading.Tasks;\n' +
          'namespace HelloWorldApplication\n{\n  public class Program\n  {\n    ' +
          'static async Task Main(string[] args)\n    {');
      });
    });

    it('should generate snippet with Space as indent type with exact indent count', function () {
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('namespace HelloWorldApplication')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal('{');
            // TODO: Do more expects
            expect(snippetArray[i + 2].charAt(0)).to.equal(' ');
          }
        }
      });
    });

    it('should add client timeout configurations when requestTimeout is set to non zero value', function () {
      convert(request, { requestTimeout: 5 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('client.Timeout = TimeSpan.FromSeconds(5);');
      });
    });

    it('should add client FollowRedirects configurations when followRedirects is set to false', function () {
      convert(request, { followRedirect: false }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.be.a('string');
        expect(snippet).to.include('AllowAutoRedirect = false');
      });
    });

    it('should create custom HttpMethod when method is non-standard', function () {
      var request = new sdk.Request({
        'method': 'NOTNORMAL',
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
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('new HttpMethod("NOTNORMAL")');
      });
    });

    it('should throw when callback is not a function', function () {
      expect(function () { convert(request, {}, 'not a function'); })
        .to.throw('C#-HttpClient-Converter: Callback is not valid function');
    });

    it('should add fake body when content type header added to empty body', function () {
      var request = new sdk.Request({
        'method': 'DELETE',
        'body': {},
        'header': [
          {
            'key': 'Content-Type',
            'value': 'application/json'
          }
        ]
      });
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.include('var content = new StringContent(string.Empty);');
        expect(snippet).to.include('content.Headers.ContentType = new MediaTypeHeaderValue(' +
          '"application/json");');
      });
    });
  });
});
