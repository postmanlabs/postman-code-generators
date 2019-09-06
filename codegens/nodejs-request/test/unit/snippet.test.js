var expect = require('chai').expect,
  sdk = require('postman-collection'),
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  sanitize = require('../../lib/util').sanitize,
  parseBody = require('../../lib/parseRequest').parseBody,
  getOptions = require('../../lib/index').getOptions,
  convert = require('../../lib/index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json');

describe('nodejs-request convert function', function () {
  var options = {indentCount: 2, indentType: 'Space'},
    testConfig = {compileScript: null, runScript: 'node run.js', fileName: 'run.js'},
    header = '/* eslint-disable */\n';

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
          newmanTestUtil.runSnippet(header + item.snippet, index, testConfig,
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
      reqObject,
      options = {},
      snippetArray,
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
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i] === 'var options = {') { line_no = i + 1; }
        }
        expect(snippetArray[line_no].charAt(0)).to.equal('\t');
      });
    });

    it('should return snippet with timeout property when timeout is set to non zero', function () {
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
        expect(snippet).to.include('timeout: 1000');
      });
    });

    it('should return snippet with followRedirect property set to ' +
        'false for no follow redirect', function () {
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
        expect(snippet).to.include('followRedirect: false');
      });
    });

    it('should return valid code snippet for no headers and no body', function () {
      reqObject = {
        'description': 'This is a sample POST request without headers and body',
        'url': 'https://echo.getpostman.com/post',
        'method': 'POST'
      };
      request = new sdk.Request(reqObject);
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('\'headers\': {\n  }');
      });
    });

    it('should not fail for a random body mode', function () {
      request = new sdk.Request(mainCollection.item[2].request);
      request.body.mode = 'random';
      request.body[request.body.mode] = {};

      convert(request, options, function (error, snippet) {

        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('body:');
      });
    });

    it('should generate snippet for file body mode', function () {
      request = new sdk.Request({
        'url': 'https://echo.getpostman.com/post',
        'method': 'POST',
        'body': {
          'mode': 'file',
          'file': [
            {
              'key': 'fileName',
              'src': 'file',
              'type': 'file'
            }
          ]
        }
      });
      options = { indentType: 'Space', indentCount: 2 };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.equal('');
      });
    });

    it('should return snippet with proper semicolon placed where required', function () {
      // testing for the below snippet
      /*
       var request = require('request');
       var fs = require('fs');
       var options = {
         'method': 'GET',
         'url': 'https://postman-echo.com/headers',
         'headers': {
           'my-sample-header': 'Lorem ipsum dolor sit amet',
           'not-disabled-header': 'ENABLED'
         }
       };
       request(options, function (error, response) {
         if (error) throw new Error(error);
         console.log(response.body);
       }); */
      request = new sdk.Request(mainCollection.item[0].request);
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        var snippetArray = snippet.split('\n');
        snippetArray.forEach(function (line, index) {
          if (line.charAt(line.length - 2) === ')') {
            expect(line.charAt(line.length - 1)).to.equal(';');
          }
          expect(line.charAt(line.length - 1)).to.not.equal(')');
          // check for the closing curly bracket of options object
          if (line.startsWith('request')) {
            var previousLine = snippetArray[index - 1];
            expect(previousLine.charAt(previousLine.length - 1)).to.equal(';');
          }
        });
      });
    });

    it('should return snippet with no trailing comma when requestTimeout ' +
      'is set to non zero and followRedirect as true', function () {
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
        expect(snippet).to.not.include('timeout: 1000,');
        expect(snippet).to.include('timeout: 1000');
      });
    });

    it('should return snippet with just a single comma when requestTimeout ' +
      'is set to non zero and followRedirect as false', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        requestTimeout: 1000,
        followRedirect: false,
        indentCount: 1,
        indentType: 'space'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }

        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('timeout: 1000,,');
        expect(snippet).to.include('timeout: 1000,\n followRedirect: false');
      });
    });

    it('should not require unused fs', function () {
      request = new sdk.Request({
        'url': 'https://postman-echo.com/get',
        'method': 'GET',
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      convert(request, {}, (error, snippet) => {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('var fs = require(\'fs\')');
      });
    });

    it('should add fs for form-data file upload', function () {
      request = new sdk.Request({
        'url': 'https://postman-echo.com/post',
        'method': 'POST',
        'body': {
          'mode': 'formdata',
          'formdata': [
            {
              'key': 'fileName',
              'src': '/some/path/file.txt',
              'type': 'file'
            }
          ]
        }
      });
      convert(request, {}, (error, snippet) => {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('var fs = require(\'fs\')');
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

    describe('parseRequest function', function () {

      it('should return empty string for empty body', function () {
        expect(parseBody(null, ' ', false)).to.equal('');
      });
    });
  });
});
