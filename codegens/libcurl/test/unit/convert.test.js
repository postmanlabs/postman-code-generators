var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  newman = require('newman'),
  parallel = require('async').parallel,
  shelljs = require('shelljs'),
  convert = require('../../index').convert,
  getOptions = require('../../index').getOptions,
  sanitize = require('../../lib/util').sanitize,
  mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * runs codesnippet then compare it with newman output
 *
 * @param {String} cFile - path of the  that contains generated code snippet
 *  @param {String} filenum - The corresponding file number of c file that will used to created executable
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (cFile, filenum, collection, done) {

  //  step by step process for compile, run code snippet, then comparing its output with newman
  parallel([
    function (callback) {

      shelljs.exec(`gcc -odata/outfiles/a${filenum}.out ${cFile} $(curl-config --cflags) $(curl-config --libs)`,
        function (e, stdout, stderr) {
          if (e) {
            return callback(e);
          }
          if (stderr) {
            return callback(stderr);
          }

          return shelljs.exec(`./data/outfiles/a${filenum}.out`, function (e, stdout, stderr) {
            if (e) {
              return callback(e);
            }
            if (stderr) {
              return callback(stderr);
            }
            var stout;

            try {
              stout = JSON.parse(stdout);
            }
            catch (err) {
              //console.error(err);
              stout = stdout;
            }
            //console.log(stout);

            return callback(null, stout);
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
      expect(result[0].toString().trim()).to.include(result[1].toString().trim());
    }
    else {
      const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime'],
        headersTodelete = [
          'accept-encoding',
          'user-agent',
          'cf-ray',
          'x-request-id',
          'x-request-start',
          'connect-time',
          'x-forwarded-for',
          'content-type',
          'kong-cloud-request-id',
          'content-length',
          'accept',
          'total-route-time',
          'cookie'
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
    var filenum = 0;

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
            indentCount: 1,
            indentType: 'tab',
            requestTimeout: 200,
            multiLine: true,
            uncomment: false
          };

        filenum += 1;

        convert(request, options, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);

            return;
          }
          fs.writeFile(`data/libcurl/test${filenum}.c`, snippet.toString(), function (err) {
            if (err) {
              return expect.fail(null, null, error);
            }

            return runSnippet(`data/libcurl/test${filenum}.c`, filenum, collection, function () {
              fs.unlink(`data/libcurl/test${filenum}.c`, (err) => {
                if (err) {
                  return expect.fail(null, null, err);
                }
                console.log(`data/libcurl/test${filenum}.c was deleted`);
                fs.unlink(`data/outfiles/a${filenum}.out`, (err) => {
                  if (err) {
                    return expect.fail(null, null, err);
                  }
                  console.log(`data/outfiles/a${filenum}.out was deleted`);
                  done();
                });
              });
            });

          });

        });
      });
    });
  });
  describe('convert function', function () {
    it('should throw an error if callback is not a function', function () {
      var request = null,
        options = {
          indentCount: 1,
          indentType: 'tab',
          requestTimeout: 200,
          multiLine: true,
          trimRequestBody: true
        },
        callback = null;

      expect(function () { convert(request, options, callback); }).to.throw(Error);
    });
    it('should not throw an error if all the options is not passed', function () {
      var request = null,
        options = {
          indentCount: 1,
          indentType: 'tab'
        },
        callback = null;

      expect(function () { convert(request, options, callback); }).to.throw(Error);
    });
  });
  describe('getOptions function', function () {
    var options = getOptions();

    it('should return an array of specific options', function () {
      expect(options).to.be.an('array');
      expect(options[0]).to.have.property('id', 'multiLine');
      expect(options[1]).to.have.property('id', 'protocol');
      expect(options[2]).to.have.property('id', 'indentCount');
      expect(options[3]).to.have.property('id', 'indentType');
      expect(options[4]).to.have.property('id', 'trimRequestBody');
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
