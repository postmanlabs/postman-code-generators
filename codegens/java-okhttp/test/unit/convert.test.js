var expect = require('chai').expect,
  sdk = require('postman-collection'),
  sanitize = require('../../lib/util').sanitize,
  convert = require('../../lib/index').convert,
  getOptions = require('../../lib/index').getOptions,
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  mainCollection = require('../../../../test/codegen/newman/fixtures/testCollection.json');

describe('okhttp convert function', function () {
  describe('convert for different request types', function () {
    var headerSnippet = 'import java.io.*;\n' +
                            'import okhttp3.*;\n' +
                            'public class main {\n' +
                            'public static void main(String []args) throws IOException{\n',
      footerSnippet = 'System.out.println(response.body().string());\n}\n}\n',
      options = {indentCount: 3, indentType: 'Space'},
      testConfig = {
        compileScript: 'javac -cp *: main.java',
        runScript: 'java -cp *: main',
        fileName: 'main.java'
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
            newmanTestUtil.runSnippet(headerSnippet + item.snippet + footerSnippet, index, testConfig,
              function (err, result) {
                if (err) {
                  expect.fail(null, null, err);
                }
                if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
                  expect(result[0].toString().trim()).to.include(result[1].toString().trim());
                }
                else {
                  expect(result[0]).deep.equal(result[1]);
                }
                return done(null);
              });
          });
        });
        return next(null);
      }
    ]);
  });

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
