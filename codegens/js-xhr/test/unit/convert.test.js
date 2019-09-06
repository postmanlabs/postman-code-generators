var expect = require('chai').expect,
  sdk = require('postman-collection'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  async = require('async'),
  sanitize = require('../../lib/util.js').sanitize,

  convert = require('../../index').convert,
  getOptions = require('../../index').getOptions;

describe('js-xhr convert function', function () {
  describe('convert for different request types', function () {
    var boilerplateCode = 'var XMLHttpRequest = require(\'xmlhttprequest\').XMLHttpRequest;\n',
      testConfig = {
        compileScript: null,
        runScript: 'node snippet.js',
        fileName: 'snippet.js'
      },
      options = {
        indentCount: 3,
        indentType: 'Space',
        includeBoilerPlate: true,
        trimRequestBody: true,
        requestTimeout: 3000
      };
    boilerplateCode += 'var FormData = require(\'form-data\');\n\n';
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
            newmanTestUtil.runSnippet(boilerplateCode + item.snippet, index, testConfig,
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

  describe('Request with no body', function () {
    var req = {
        'method': 'GET',
        'url': {
          'raw': 'https://postman-echo.com/get',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'get'
          ]
        },
        'description': 'Request without a body'
      },

      request = new sdk.Request(req),
      options = {
        indentCount: 2,
        indentType: 'Space'
      };
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
        return;
      }

      it('should not be empty', function () {
        expect(snippet).not.to.equal('');
      });
      it('should not contain var data =', function () {
        expect(snippet).to.deep.not.include('var data =');
      });
      it('should contain xhr.send();', function () {
        expect(snippet).to.deep.include('xhr.send();');
      });
    });
  });
  describe('Request with empty body', function () {
    var req = {
        'method': 'GET',
        'body': {},
        'url': {
          'raw': 'https://postman-echo.com/get',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'get'
          ]
        },
        'description': 'Request without a body'
      },

      request = new sdk.Request(req),
      options = {
        indentCount: 2,
        indentType: 'Space'
      };
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
        return;
      }

      it('should not be empty', function () {
        expect(snippet).not.to.equal('');
      });
      it('should not contain var data =', function () {
        expect(snippet).to.deep.not.include('var data =');
      });
      it('should contain xhr.send();', function () {
        expect(snippet).to.deep.include('xhr.send();');
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
    it('should have default body trim set as false', function () {
      expect(options[3].default).to.equal(false);
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
