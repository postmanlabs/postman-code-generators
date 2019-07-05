var expect = require('chai').expect,
  fs = require('fs'),
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  parallel = require('async').parallel,

  sanitize = require('../../lib/util').sanitize,
  parseBody = require('../../lib/parseRequest').parseBody,
  getOptions = require('../../lib/index').getOptions,
  convert = require('../../lib/index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * compiles and runs codesnippet then compare it with newman output
 * 
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async call from mocha
 */
function runSnippet (codeSnippet, collection, done) {
  fs.writeFile('run.js', codeSnippet, function (err) {
    if (err) {
      expect.fail(null, null, err);
      return done();
    }

    var run = 'node run.js';

    //  step by step process for compile, run code snippet, then comparing its output with newman
    parallel([
      function (callback) {
        exec(run, function (err, stdout, stderr) {
          if (err) {
            return callback(err);
          }
          if (stderr) {
            return callback(stderr);
          }

          try {
            stdout = JSON.parse(stdout);
          }
          catch (e) {
            console.error(e);
          }
          return callback(null, stdout);
        });
      },
      function (callback) {
        newman.run({
          collection: collection
        }).on('request', function (err, summary) {
          if (err) {
            return callback(err);
          }

          var stdout = summary.response.stream.toString();
          try {
            stdout = JSON.parse(stdout);
          }
          catch (e) {
            console.error(e);
          }
          return callback(null, stdout);
        });
      }
    ], function (err, result) {
      if (err) {
        console.error(err);
        expect.fail(null, null, err);
      }
      else if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
        expect(result[0].trim()).to.equal(result[1].trim());
      }
      else {
        const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'clientIPAddress'],
          headersTodelete = [
            'accept-encoding',
            'user-agent',
            'cf-ray',
            'x-request-id',
            'x-request-start',
            'connect-time',
            'x-forwarded-for',
            'content-type',
            'content-length',
            'accept',
            'total-route-time',
            'cookie',
            'kong-cloud-request-id',
            'cache-control',
            'postman-token',
            'x-real-ip'
          ];
        if (result[0]) {
          propertiesTodelete.forEach(function (property) {
            delete result[0][property];
          });
          if (result[0].headers) {
            headersTodelete.forEach(function (property) {
              delete result[0].headers[property];
            });
          }
        }
        if (result[1]) {
          propertiesTodelete.forEach(function (property) {
            delete result[1][property];
          });
          if (result[1].headers) {
            headersTodelete.forEach(function (property) {
              delete result[1].headers[property];
            });
          }
        }
        expect(result[0]).deep.equal(result[1]);
      }
      return done();
    });
  });
}

describe('nodejs-request convert function', function () {
  mainCollection.item.forEach(function (item) {
    it(item.name, function (done) {
      var request = new sdk.Request(item.request),
        collection = {
          item: [
            {
              request: request.toJSON()
            }
          ]
        };
      convert(request, {indentCount: 3, indentType: 'space'}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        //  disabling eslint for test file
        snippet = '/* eslint-disable */\n' + snippet;

        runSnippet(snippet, collection, done);
      });
    });
  });

  describe('Convert function', function () {
    var request,
      reqObject,
      options = {},
      snippetArray,
      line_no;

    it('should return a tab indented snippet ', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        indentType: 'tab',
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
        expect(snippet).to.include('\'headers\': {\n}');
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
