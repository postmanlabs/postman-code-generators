var expect = require('chai').expect,
  fs = require('fs'),
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  parallel = require('async').parallel,

  convert = require('../../lib/index').convert,
  sanitize = require('../../lib/util').sanitize,
  getUrlStringfromUrlObject = require('../../lib/parseRequest').getUrlStringfromUrlObject,
  getOptions = require('../../index').getOptions,
  mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * compiles and runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
  fs.writeFileSync('main.java', codeSnippet);

  //  classpath of external libararies for java to compile
  var compile = 'javac -cp *: main.java',

    //  bash command stirng for run compiled java file
    run = 'java -cp *: main';

  //  step by step process for compile, run code snippet, then comparing its output with newman
  parallel([
    function (callback) {
      exec(compile, function (err, stdout, stderr) {
        if (err) {
          return callback(err);
        }
        if (stderr) {
          return callback(stderr);
        }
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
}

describe('java unirest convert function for test collection', function () {
  var headerSnippet = 'import com.mashape.unirest.http.*;\n' +
                        'import java.io.*;\n' +
                        'public class main {\n' +
                        'public static void main(String []args) throws Exception{\n',
    footerSnippet = 'System.out.println(response.getBody());\n}\n}\n';

  mainCollection.item.forEach(function (item) {
    // Skipping tests for CI
    it(item.name, function (done) {
      var request = new sdk.Request(item.request),
        collection = {
          item: [
            {
              request: request.toJSON()
            }
          ]
        };
      convert(request, {indentCount: 3, indentType: 'Space'}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        runSnippet(headerSnippet + snippet + footerSnippet, collection, done);
      });
    });
  });
  describe('convert function', function () {
    var request,
      reqObject,
      options = {},
      snippetArray,
      indentString = '\t',
      headerSnippet,
      footerSnippet,
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
        /* eslint-disable max-len */
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i] === 'HttpResponse<String> response = Unirest.get("https://postman-echo.com/headers")') {
            line_no = i + 1;
          }
        }
        /* eslint-enable max-len */
        expect(snippetArray[line_no].charAt(0)).to.equal('\t');
      });
    });

    it('should return snippet with setTimeouts function when timeout is set to non zero', function () {
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
        expect(snippet).to.include('.setTimeouts(0, 1000)');
      });
    });

    it('should return snippet with setTimeouts function setting both ' +
            'connection and socket timeout to 0 when requestTimeout is set to 0', function () {
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
        expect(snippet).to.include('.setTimeouts(0, 0)');
      });
    });

    it('should return snippet with disableRedirectHandling function for' +
            'follow redirect option set to false', function () {
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
        expect(snippet).to.include('.disableRedirectHandling()');
      });
    });

    it('should include import statements, main class and print statements ' +
            'when includeBoilerplate is set to true', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        includeBoilerplate: true,
        indentType: 'Tab',
        indentCount: 1
      };
      headerSnippet = 'import com.mashape.unirest.http.*;\n' +
                        'import java.io.*;\n' +
                        'public class main {\n' +
                        indentString + 'public static void main(String []args) throws Exception{\n';
      footerSnippet = indentString.repeat(2) + 'System.out.println(response.getBody());\n' +
                        indentString + '}\n}\n';

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include(headerSnippet);
        expect(snippet).to.include(footerSnippet);
      });
    });

    it('should return valid code snippet for no headers and no body', function () {
      reqObject = {
        'description': 'This is a sample POST request without headers and body',
        'url': 'https://echo.getpostman.com/post',
        'method': 'POST'
      };
      request = new sdk.Request(reqObject);
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('.header');
        expect(snippet).to.not.include('.body');
        expect(snippet).to.not.include('.field');
      });
    });

    it('should replace propfind by default get method as unirest java only supports standard ' +
        'six HTTP methods', function () {
      reqObject = {
        'description': 'This is a sample PROPFIND request',
        'url': 'https://mockbin.org/request',
        'method': 'PROPFIND'
      };
      request = new sdk.Request(reqObject);
      options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.not.include('.propfind');
        expect(snippet).to.include('.get');
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
      convert(request, {}, function (error, snippet) {
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
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http://postman-echo.com/post?a=b%20c');
        expect(snippet).to.not.include('http://postman-echo.com/post?a=b c');
      });
    });
  });
  describe('getUrlStringfromUrlObject function', function () {
    var rawUrl, urlObject, outputUrlString;

    it('should return empty string for an url object for an empty url or if no url object is passed', function () {
      rawUrl = '';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.be.empty;
      outputUrlString = getUrlStringfromUrlObject();
      expect(outputUrlString).to.be.empty;
    });

    it('should add protocol if present in the url object', function () {
      rawUrl = 'https://postman-echo.com';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.equal(rawUrl);
    });

    it('should add the auth information if present in the url object', function () {
      rawUrl = 'https://user:password@postman-echo.com';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.equal(rawUrl);
    });

    it('should not add the auth information if user isn\'t present but' +
    ' password is present in the url object', function () {
      rawUrl = 'https://:password@postman-echo.com';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.not.include(':password');
    });

    it('should add host if present in the url object', function () {
      rawUrl = 'https://postman-echo.com';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.equal(rawUrl);
    });

    it('should add port if present in the url object', function () {
      rawUrl = 'https://postman-echo.com:8080';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.equal(rawUrl);
    });

    it('should add path if present in the url object', function () {
      rawUrl = 'https://postman-echo.com/get';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.equal(rawUrl);
    });

    describe('queryParams', function () {

      it('should not encode unresolved query params', function () {
        rawUrl = 'https://postman-echo.com/get?key={{value}}';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.not.include('key=%7B%7Bvalue%7B%7B');
        expect(outputUrlString).to.equal(rawUrl);
      });

      it('should encode query params other than unresolved variables', function () {
        rawUrl = 'https://postman-echo.com/get?key=\'a b c\'';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.not.include('key=\'a b c\'');
        expect(outputUrlString).to.equal('https://postman-echo.com/get?key=%27a%20b%20c%27');
      });

      it('should not encode unresolved query params and ' +
      'encode every other query param, both present together', function () {
        rawUrl = 'https://postman-echo.com/get?key1={{value}}&key2=\'a b c\'';
        urlObject = new sdk.Url(rawUrl);
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.not.include('key1=%7B%7Bvalue%7B%7B');
        expect(outputUrlString).to.not.include('key2=\'a b c\'');
        expect(outputUrlString).to.equal('https://postman-echo.com/get?key1={{value}}&key2=%27a%20b%20c%27');
      });

      it('should discard disabled query params', function () {
        urlObject = new sdk.Url({
          protocol: 'https',
          host: 'postman-echo.com',
          query: [
            { key: 'foo', value: 'bar' },
            { key: 'alpha', value: 'beta', disabled: true }
          ]
        });
        outputUrlString = getUrlStringfromUrlObject(urlObject);
        expect(outputUrlString).to.equal('https://postman-echo.com?foo=bar');
      });
    });

    it('should add hash if present in the url object', function () {
      rawUrl = 'https://postmanm-echo.com/get#hash';
      urlObject = new sdk.Url(rawUrl);
      outputUrlString = getUrlStringfromUrlObject(urlObject);
      expect(outputUrlString).to.equal(rawUrl);
    });
  });
  describe('getOptions function', function () {

    it('should return an array of specific options', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'includeBoilerplate');
      expect(getOptions()[1]).to.have.property('id', 'indentCount');
      expect(getOptions()[2]).to.have.property('id', 'indentType');
      expect(getOptions()[3]).to.have.property('id', 'requestTimeout');
      expect(getOptions()[4]).to.have.property('id', 'followRedirect');
      expect(getOptions()[5]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('sanitize function', function () {
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
