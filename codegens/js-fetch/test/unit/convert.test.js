var expect = require('chai').expect,
  sdk = require('postman-collection'),
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  sanitize = require('../../lib/util').sanitize,
  getOptions = require('../../index').getOptions,
  convert = require('../../index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json');

describe('js-fetch convert function for test collection', function () {
  var testSnippet = 'var fetch = require(\'node-fetch\'),\nFormData = require(\'form-data\'),\n',
    testConfig = {
      compileScript: null,
      runScript: 'node snippet.js',
      fileName: 'snippet.js'
    },
    options = {
      indentCount: 2,
      indentType: 'Tab',
      multiLine: true,
      followRedirect: true,
      longFormat: true
    };
  testSnippet += 'Headers = require(\'node-fetch\').Headers,\n';
  testSnippet += 'URLSearchParams = require(\'url\').URLSearchParams;\n\n';

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
          newmanTestUtil.runSnippet(testSnippet + item.snippet, index, testConfig,
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

  describe('Convert function', function () {
    var request,
      options,
      snippetArray,
      line_no;

    it('should return a Space indented snippet ', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        indentType: 'Space',
        indentCount: 2
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }

        expect(snippet).to.be.a('string');
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i] === 'var requestOptions = {') { line_no = i + 1; }
        }
        expect(snippetArray[line_no].charAt(0)).to.equal(' ');
        expect(snippetArray[line_no].charAt(1)).to.equal(' ');
      });
    });

    it('should return snippet with no setTimeout function when timeout is set to zero', function () {
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
        expect(snippet).to.not.include('.setTimeout');
      });
    });

    it('should return snippet with redirect property set to manual for ' +
                'no follow redirect', function () {
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
        expect(snippet).to.include('redirect: \'manual\'');
      });
    });

    it('should return snippet with redirect property set to follow for ' +
                ' follow redirect', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        followRedirect: true
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('redirect: \'follow\'');
      });
    });

    it('should default to mode raw body mode is some random value', function () {
      request = new sdk.Request(mainCollection.item[2].request);
      request.body.mode = 'random';
      request.body[request.body.mode] = {};
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('body: raw');
      });
    });

    it('should generate snippet for no body provided', function () {
      request = new sdk.Request({
        'method': 'GET',
        'url': {
          'raw': 'https://mockbin.org/request',
          'protocol': 'https',
          'host': [
            'mockbin',
            'org'
          ],
          'path': [
            'request'
          ]
        }
      });
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
      });
    });
  });

  describe('getOptions function', function () {

    it('should return an array of specific options', function () {
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
