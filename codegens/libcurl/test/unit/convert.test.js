var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../index').convert,
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  getOptions = require('../../index').getOptions,
  sanitize = require('../../lib/util').sanitize,
  mainCollection = require('../../../../test/codegen/newman/fixtures/testCollection.json');

describe('libcurl convert function', function () {
  describe('convert for different request types', function () {
    var options = {
        indentCount: 1,
        indentType: 'Tab',
        useMimeType: false,
        includeBoilerplate: true
      },
      testConfig = {
        compileScript: '`curl-config --cc --cflags` -o executableFile testFile.c `curl-config --libs`',
        runScript: './executableFile',
        fileName: 'testFile.c'
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

    it('should throw an error if callback is not a function', function () {
      var request = null,
        options = {
          indentCount: 1,
          indentType: 'Tab',
          requestTimeout: 200,
          trimRequestBody: true
        },
        callback = null;

      expect(function () { convert(request, options, callback); }).to.throw(Error);
    });

    it('should set CURLOPT_TIMEOUT_MS parameter when requestTimeout is set to non zero value', function () {
      var request = new sdk.Request(mainCollection.item[0].request),
        options = { requestTimeout: 3000 };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, 3000L);');
      });
    });
  });

  describe('getOptions function', function () {
    var options = getOptions();

    it('should return an array of specific options', function () {
      expect(options).to.be.an('array');
      expect(options[0]).to.have.property('id', 'includeBoilerplate');
      expect(options[1]).to.have.property('id', 'protocol');
      expect(options[2]).to.have.property('id', 'indentCount');
      expect(options[3]).to.have.property('id', 'indentType');
      expect(options[4]).to.have.property('id', 'trimRequestBody');
      expect(options[5]).to.have.property('id', 'useMimeType');
    });
  });

  describe('Sanitize function', function () {

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
