var expect = require('chai').expect,
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  parallel = require('async').parallel,
  convert = require('../../index').convert,
  sanitize = require('../../lib/util/sanitize').quote,
  mainCollection = require('../../examples/test-collection.json');


/**
 * runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
  //  step by step process for compile, run code snippet, then comparing its output with newman
  parallel([
    function (callback) {

      // This is added for shelljs module i.e. it hangs if printf is not provided.
      codeSnippet = 'printf \'\' | ' + codeSnippet;
      return exec(codeSnippet, function (err, stdout, stderr) {
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
        // }
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
          'x-request-id',
          'x-request-start',
          'connect-time',
          'x-forwarded-for',
          'x-forwarded-port',
          'content-type',
          'content-length',
          'accept',
          'total-route-time',
          'cookie',
          'kong-cloud-request-id',
          'x-real-ip',
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

describe('Shell-Httpie convert function', function () {
  describe('convert for different request types', function () {

    mainCollection.item.forEach(function (item) {
      if (item.request.body.mode !== 'formdata') {
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
              multiLine: true,
              followRedirect: true,
              longFormat: true
            };

          convert(request, options, function (error, snippet) {
            if (error) {
              expect.fail(null, null, error);
              return;
            }
            runSnippet(snippet, collection, done);
          });
        });
      }
    });
  });

  it('should add a timeout of 1 hour (3600 seconds) for RequestTimeout set to 0', function () {
    var request = new sdk.Request({
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
      }),
      options = {
        requestTimeout: 0
      };
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('--timeout 3600');
    });
  });

  it('should add port in the url when host has port specified', function () {
    var request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'https://localhost:3000/getSelfBody',
          'protocol': 'https',
          'host': [
            'localhost'
          ],
          'port': '3000',
          'path': [
            'getSelfBody'
          ]
        }
      }),
      options = {};
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('GET localhost:3000/getSelfBody');
    });
  });
});

describe('Sanitize function', function () {
  it('should return empty string when input is not a string type', function () {
    expect(sanitize(123)).to.equal('');
    expect(sanitize(null)).to.equal('');
    expect(sanitize({})).to.equal('');
    expect(sanitize([])).to.equal('');
  });
});
