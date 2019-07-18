var expect = require('chai').expect,
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  fs = require('fs'),
  parallel = require('async').parallel,
  sanitize = require('../../lib/util.js').sanitize,

  convert = require('../../index').convert,
  getOptions = require('../../index').getOptions,
  mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
  fs.writeFileSync('snippet.js', codeSnippet);
  var run = 'node snippet.js';

  //  step by step process for compile, run code snippet, then comparing its output with newman
  parallel([
    function (callback) {
      return exec(run, function (err, stdout, stderr) {
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
      expect.fail(null, null, err);
    }
    else if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
      expect(result[0].trim()).to.include(result[1].trim());
    }
    else {
      const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'clientIPAddress'],
        headersTodelete = [
          'accept-encoding',
          'user-agent',
          'cf-ray',
          'x-real-ip',
          'x-request-id',
          'x-request-start',
          'connect-time',
          'x-forwarded-for',
          'content-type',
          'kong-cloud-request-id',
          'content-length',
          'accept',
          'total-route-time',
          'cookie',
          'kong-cloud-request-id',
          'cache-control',
          'postman-token'
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
}

describe('js-xhr convert function', function () {
  describe('convert for different request types', function () {
    var boilerplateCode = 'var XMLHttpRequest = require(\'xmlhttprequest\').XMLHttpRequest;\n';
    boilerplateCode += 'var FormData = require(\'form-data\');\n\n';

    mainCollection.item.forEach(function (item) {
      it(item.name, function (done) {
        var request = new sdk.Request(item.request),
          collection = {
            item: [
              {
                request: request.toJSON()
              }
            ]
          },
          options = {
            indentCount: 3,
            indentType: 'Space',
            trimRequestBody: true,
            requestTimeout: 3000
          };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
            return;
          }
          runSnippet(boilerplateCode + snippet, collection, done);
        });
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

  describe('POST Form data Request', function () {
    var req = {
        'method': 'POST',
        'header': [
          {
            'key': 'Content-Type',
            'value': 'application/x-www-form-urlencoded',
            'disabled': true
          },
          {
            'key': 'Content-Type',
            'value': 'application/json',
            'disabled': true
          }
        ],
        'body': {
          'mode': 'formdata',
          'formdata': [
            {
              'key': 'fdjks',
              'value': 'dsf',
              'description': '',
              'type': 'text',
              'disabled': true
            },
            {
              'key': 'sdf',
              'value': 'helo',
              'description': '',
              'type': 'text'
            },
            {
              'key': '12',
              'value': '"23"',
              'description': '',
              'type': 'text'
            },
            {
              'key': '\'123\'',
              'value': '1234',
              'description': '',
              'type': 'text'
            }
          ]
        },
        'url': {
          'raw': 'https://postman-echo.com/post',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'post'
          ]
        },
        'description': 'The HTTP `POST` request with formData'
      },

      request = new sdk.Request(req),
      options = {
        indentCount: 2,
        indentType: 'Space',
        trimRequestBody: false,
        requestTimeout: 3000
      };
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
        return;
      }

      it('should not be empty', function () {
        expect(snippet).not.to.equal('');
      });

      it('should contain formData object', function () {
        expect(snippet).to.deep.include('var data = new FormData()');
        expect(snippet).to.deep.include('data.append("sdf", "helo")');
      });

      it('should add timeout option when timeout is set to non zero value', function () {
        expect(snippet).to.include('xhr.timeout = 3000');
      });
    });
  });
  describe('getOptions function', function () {
    var options = getOptions();
    it('should return an array of specific options', function () {
      expect(options).to.be.an('array');
    });
    it('should have 2 as default indent count ', function () {
      expect(options[0].default).to.equal(2);
    });
    it('should have Space as default indent type ', function () {
      expect(options[1].default).to.equal('Space');
    });
    it('should have 0 as default request timeout ', function () {
      expect(options[2].default).to.equal(0);
    });
    it('should have default body trim set as true', function () {
      expect(options[3].default).to.equal(true);
    });
  });
  describe('convert function', function () {
    it('should throw an error if callback is not a function', function () {
      var request = null,
        options = [],
        callback = null;
      expect(function () { convert(request, options, callback); }).to.throw(Error);
    });
  });
});
