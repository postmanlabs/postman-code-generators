var expect = require('chai').expect,
  sdk = require('postman-collection'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  async = require('async'),
  convert = require('../../index').convert;

describe('Golang convert function', function () {
  describe('convert for different request types', function () {
    var testConfig = {
        runSnippet: 'go run snippet.go',
        compileSnippet: null,
        fileName: 'snippet.go'
      },
      options = {
        indentCount: 1,
        indentType: 'Tab',
        requestTimeout: 5000,
        followRedirect: true,
        trimRequestBody: false
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
  });
});
