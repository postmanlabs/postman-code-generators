var expect = require('chai').expect,
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  parallel = require('async').parallel,

  convert = require('../../index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json');

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
        if (summary.request.method === 'HEAD') {
          stdout = summary.response.code.toString();
          return callback(null, stdout);
        }
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
          'kong-request-id',
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

describe('curl convert function', function () {
  describe('convert for different request types', function () {

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
            requestTimeout: 200,
            multiLine: true,
            followRedirect: true,
            longFormat: true,
            silent: true,
            lineContinuationCharacter: '\\'
          };
        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
            return;
          }
          runSnippet(snippet, collection, done);
        });
      });
    });
  });

  describe('Convert function', function () {
    var request, options, snippetArray, line;

    it('should return snippet with carat(^) as line continuation ' +
            'character for multiline code generation', function () {
      request = new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        multiLine: true,
        lineContinuationCharacter: '^'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        snippetArray = snippet.split('\n');
        // Ignoring the last line as there is no line continuation character at last line
        for (var i = 0; i < snippetArray.length - 1; i++) {
          line = snippetArray[i];
          expect(line.charAt(line.length - 1)).to.equal('^');
        }
      });
    });

    it('should parse header with string value properly', function () {
      request = new sdk.Request({
        'method': 'POST',
        'header': [
          {
            'key': 'foo',
            'value': '"bar"'
          }
        ],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        longFormat: false
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.include('-H "foo: \\\"bar\\\""'); // eslint-disable-line no-useless-escape
      });
    });

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
        expect(snippet).to.include('GET "https://google.com"');
      });
    });

    it('should return snippet with backslash(\\) character as line continuation ' +
         'character for multiline code generation', function () {
      request = new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });
      options = {
        multiLine: true,
        lineContinuationCharacter: '\\'
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        snippetArray = snippet.split('\n');
        // Ignoring the last line as there is no line continuation character at last line
        for (var i = 0; i < snippetArray.length - 1; i++) {
          line = snippetArray[i];
          expect(line.charAt(line.length - 1)).to.equal('\\');
        }
      });
    });

    it('should not encode queryParam unresolved variables and ' +
    'leave it inside double parenthesis {{xyz}}', function () {
      request = new sdk.Request({
        'method': 'POST',
        'header': [],
        'url': {
          'raw': 'http://postman-echo.com/post?a={{xyz}}',
          'protocol': 'http',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'post'
          ],
          'query': [
            {
              'key': 'a',
              'value': '{{xyz}}'
            }
          ]
        }
      });
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http://postman-echo.com/post?a={{xyz}}');
        expect(snippet).to.not.include('http://postman-echo.com/post?a=%7B%7Bxyz%7D%7D');
      });
    });

    it('should encode queryParams other than unresolved variables', function () {
      request = new sdk.Request({
        'method': 'POST',
        'header': [],
        'url': {
          'raw': 'http://postman-echo.com/post?a=b c',
          'protocol': 'http',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'post'
          ],
          'query': [
            {
              'key': 'a',
              'value': 'b c'
            }
          ]
        }
      });
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http://postman-echo.com/post?a=b%20c');
        expect(snippet).to.not.include('http://postman-echo.com/post?a=b c');
      });
    });
  });
});
