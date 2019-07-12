var expect = require('chai').expect,
  fs = require('fs'),
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  parallel = require('async').parallel,
  sanitize = require('../../lib/util').sanitize,
  convert = require('../../lib/index').convert,
  getOptions = require('../../lib/index').getOptions,
  mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * compiles and runs codesnippet then compare it with newman output
 * 
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
  fs.writeFile('main.java', codeSnippet, function (err) {
    if (err) {
      expect.fail(null, null, err);
      return done();
    }

    //  classpath of external libararies for java to compile 
    var compile = 'javac -cp *.jar main.java',

      //  bash command stirng for run compiled java file
      run = 'java -cp *.jar main';

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
            'x-real-ip',
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

describe('okhttp convert function', function () {
  describe('convert for different request types', function () {
    var headerSnippet = 'import java.io.*;\n' +
                            'import okhttp3.*;\n' +
                            'public class main {\n' +
                            'public static void main(String []args) throws IOException{\n',
      footerSnippet = 'System.out.println(response.body().string());\n}\n}\n';

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
          runSnippet(headerSnippet + snippet + footerSnippet, collection, done);
        });
      });
    });
  });

  describe('convert function', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      snippetArray,
      options = {
        includeBoilerplate: true,
        indentType: 'tab',
        indentCount: 2
      };

    const SINGLE_SPACE = ' ';

    it('should generate snippet with default options given no options', function () {
      convert(request, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('public class main {')) {
            expect(snippetArray[i + 1].substr(0, 4)).to.equal(SINGLE_SPACE.repeat(4));
            expect(snippetArray[i + 1].charAt(4)).to.not.equal(SINGLE_SPACE);
          }
        }
      });
    });

    it('should return snippet with boilerplate code given option', function () {
      convert(request, { includeBoilerplate: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('import java.io.*;\nimport okhttp3.*;\npublic class main {\n');
      });
    });

    it('should return snippet with requestTimeout given option', function () {
      convert(request, { requestTimeout: 1000 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('.setConnectTimeout(1000, TimeUnit.MILLISECONDS)');
      });
    });

    it('should return snippet without followRedirect given option', function () {
      convert(request, { followRedirect: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.not.include('.followRedirects(false)');
      });
    });

    it('should generate snippet with tab as an indent type with exact indent count', function () {
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('public class main {')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal('\t');
            expect(snippetArray[i + 1].charAt(1)).to.equal('\t');
            expect(snippetArray[i + 1].charAt(2)).to.not.equal('\t');
          }
        }
      });
    });
  });

  describe('getOptions function', function () {
    it('should return array of options for csharp-restsharp converter', function () {
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
    it('should handle invalid parameters', function () {
      expect(sanitize(123, false)).to.equal('');
      expect(sanitize(' inputString', true)).to.equal('inputString');
    });
  });
});
