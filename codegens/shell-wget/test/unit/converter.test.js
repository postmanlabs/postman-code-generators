var expect = require('chai').expect,
  sdk = require('postman-collection'),
  sanitize = require('../../lib/util/sanitize').sanitize,
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert,
  getOptions = require('../../lib/index').getOptions,
  mainCollection = require('../unit/fixtures/sample_collection.json');

describe('Shell-Wget converter', function () {
  var options = {
      indentType: 'Space',
      indentCount: 2
    },
    testConfig = {};
  runNewmanTest(convert, options, testConfig);

  describe('convert function', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      snippetArray,
      options = {
        indentType: 'Tab',
        indentCount: 2
      };

    const SINGLE_SPACE = ' ',
      SINGLE_TAB = '\t';

    it('should return snippet with requestTimeout given option', function () {
      convert(request, { requestTimeout: 10000 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('--timeout=10');
      });
    });

    it('should return snippet without followRedirect given option', function () {
      convert(request, { followRedirect: false }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('--max-redirect=0');
      });
    });

    it('should generate snippet with default options given no options', function () {
      convert(request, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('wget --no-check-certificate --quiet')) {
            expect(snippetArray[i + 1].substr(0, 2)).to.equal(SINGLE_SPACE.repeat(2));
            expect(snippetArray[i + 1].charAt(4)).to.not.equal(SINGLE_SPACE);
          }
        }
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
          if (snippetArray[i].startsWith('wget --no-check-certificate --quiet')) {
            expect(snippetArray[i + 1].substr(0, 2)).to.equal(SINGLE_TAB.repeat(2));
            expect(snippetArray[i + 1].charAt(2)).to.not.equal(SINGLE_TAB);
          }
        }
      });
    });

    it('should generate snippet with timout flag set as 0 (infinite) when requestTimeout is set as 0', function () {
      convert(request, {requestTimeout: 0}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('--timeout=0');
      });
    });
  });

  describe('getOptions function', function () {
    it('should return array of options for csharp-restsharp converter', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'indentCount');
      expect(getOptions()[1]).to.have.property('id', 'indentType');
      expect(getOptions()[2]).to.have.property('id', 'requestTimeout');
      expect(getOptions()[3]).to.have.property('id', 'followRedirect');
      expect(getOptions()[4]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('sanitize function', function () {
    it('should handle invalid parameters', function () {
      expect(sanitize(123, 'raw', false)).to.equal('');
      expect(sanitize('inputString', 123, false)).to.equal('inputString');
      expect(sanitize(' inputString', 'test', true)).to.equal('inputString');
    });
  });
});
