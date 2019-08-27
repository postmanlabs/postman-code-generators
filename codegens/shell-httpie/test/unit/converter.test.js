var expect = require('chai').expect,
  sdk = require('postman-collection'),
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  convert = require('../../index').convert,
  sanitize = require('../../lib/util/sanitize').quote;

describe('Shell-Httpie convert function', function () {
  describe('convert for different request types', function () {
    var options = {
      indentType: 'Space',
      indentCount: 4
    };
    async.waterfall([
      function (next) {
        newmanTestUtil.generateSnippet(convert, options, function (error, snippets) {
          if (error) {
            return next(error);
          }
          return next(null, snippets);
        });
      },
      function (snippets, next) {
        snippets.forEach((item, index) => {
          it(item.name, function (done) {
            newmanTestUtil.runSnippet('printf \'\' | ' + item.snippet, index, {},
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
});

describe('Sanitize function', function () {
  it('should return empty string when input is not a string type', function () {
    expect(sanitize(123)).to.equal('');
    expect(sanitize(null)).to.equal('');
    expect(sanitize({})).to.equal('');
    expect(sanitize([])).to.equal('');
  });
});
