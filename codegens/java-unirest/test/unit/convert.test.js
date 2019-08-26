var expect = require('chai').expect,
  sdk = require('postman-collection'),
  async = require('async'),
  convert = require('../../lib/index').convert,
  sanitize = require('../../lib/util').sanitize,
  getOptions = require('../../index').getOptions,
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  mainCollection = require('./fixtures/testcollection/collection.json');

describe('java unirest convert function for test collection', function () {
  var headerSnippet = 'import com.mashape.unirest.http.*;\n' +
                        'import java.io.*;\n' +
                        'public class main {\n' +
                        'public static void main(String []args) throws Exception{\n',
    footerSnippet = 'System.out.println(response.getBody());\n}\n}\n',
    testConfig = {
      runSnippet: 'java -cp *: main',
      compileSnippet: 'javac -cp *: main.java',
      fileName: 'main.java'
    },
    options = {indentCount: 3, indentType: 'Space'};
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

              expect(result[0]).deep.equal(result[1]);
              return done(null);
            });
        });
      });
      return next(null);
    }
  ]);
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
