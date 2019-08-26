var expect = require('chai').expect,
  sdk = require('postman-collection'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  async = require('async'),
  convert = require('../../index').convert;
  // mainCollection = require('../../../../test/codegen/newman/fixtures/testCollection.json');

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
    async.waterfall([
      function (next) {
        newmanTestUtil.generateSnippet(convert, options, function (error, snippets) {
          if (error) {
            expect.fail(null, null, error);
            return next(error);
          }

          return next(null, snippets);
        });
      },
      function (snippets, next) {
        snippets.forEach((item, index) => {
          it(item.name, function (done) {
            newmanTestUtil.runSnippet(item.snippet, index, testConfig,
              function (err, result) {
                if (err) {
                  expect.fail(null, null, err);
                }
                if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
                  expect(result[0].toString().trim()).to.include(result[1].toString().trim());
                }

                expect(result[0]).deep.equal(result[1]);
                return done(null);
              });
          });
        });
        return next(null);
      }
    ]);
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
  });
});
