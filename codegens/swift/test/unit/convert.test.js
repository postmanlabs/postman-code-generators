var expect = require('chai').expect,
  sdk = require('postman-collection'),
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  convert = require('../../index').convert,
  sanitize = require('../../lib/util').sanitize,
  getOptions = require('../../index').getOptions,
  mainCollection = require('./fixtures/testcollection/collection.json');


describe('Swift Converter', function () {
  describe('convert for different request types', function () {
    var options = {
        indentType: 'Space',
        indentCount: 4
      },
      // if running locally on mac change the runScript to 'swift snippet.swift'
      testConfig = {
        fileName: 'snippet.swift',
        runScript: 'swift-5.0.1-RELEASE-ubuntu16.04/usr/bin/./swift snippet.swift'
      };
    async.waterfall([
      function (next) {
        newmanTestUtil.generateSnippet(convert, options, function (error, snippets) {
          if (error) {
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
    var request = new sdk.Request(mainCollection.item[0].request),
      snippetArray;

    const SINGLE_SPACE = ' '; // default indent type with indent count of 2
    it('should generate snippet with default options given no options', function () {
      convert(request, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('let task = URLSession.shared.dataTask')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal(SINGLE_SPACE);
            expect(snippetArray[i + 1].charAt(1)).to.equal(SINGLE_SPACE);
          }
        }
      });
    });

    it('should generate snippet with Space as an indent type with default indent count', function () {
      convert(request, { indentType: 'Space' }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('let task = URLSession.shared.dataTask')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal(SINGLE_SPACE);
            expect(snippetArray[i + 1].charAt(1)).to.equal(SINGLE_SPACE);
          }
        }
      });
    });

    it('should add infinite timeout when requestTimeout is set to 0', function () {
      convert(request, { requestTimeout: 0}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('timeoutInterval: Double.infinity');

      });
    });
  });

  describe('getOptions function', function () {
    it('should return array of options for swift-urlsession converter', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'indentCount');
      expect(getOptions()[1]).to.have.property('id', 'indentType');
      expect(getOptions()[2]).to.have.property('id', 'requestTimeout');
      expect(getOptions()[3]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('sanitize function', function () {
    it('should handle invalid parameters', function () {
      expect(sanitize(123, 'raw', false)).to.equal('');
      expect(sanitize('inputString', 123, true)).to.equal('inputString');
    });
  });
});
