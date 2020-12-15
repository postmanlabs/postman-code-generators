var expect = require('chai').expect,
  sdk = require('postman-collection'),
  sanitize = require('../../lib/util.js').sanitize,

  convert = require('../../index').convert,
  getOptions = require('../../index').getOptions;

describe('js-xhr convert function', function () {

  it('should trim header keys and not trim header values', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [
        {
          'key': '   key_containing_whitespaces  ',
          'value': '  value_containing_whitespaces  '
        }
      ],
      'url': {
        'raw': 'https://google.com',
        'protocol': 'https',
        'host': [
          'google',
          'com'
        ]
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('xhr.setRequestHeader("key_containing_whitespaces", ' +
      '"  value_containing_whitespaces  ")');
    });
  });

  it('should include JSON.stringify in the snippet for raw json bodies', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [
        {
          'key': 'Content-Type',
          'value': 'application/json'
        }
      ],
      'body': {
        'mode': 'raw',
        'raw': '{\n  "json": "Test-Test"\n}'
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
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('JSON.stringify({\n  "json": "Test-Test"\n})');
    });
  });

  it('should use JSON.parse if the content-type is application/vnd.api+json', function () {
    let request = new sdk.Request({
      'method': 'POST',
      'header': [
        {
          'key': 'Content-Type',
          'value': 'application/vnd.api+json'
        }
      ],
      'body': {
        'mode': 'raw',
        'raw': '{"data": {"hello": "world"} }'
      },
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
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('JSON.stringify({\n  "data": {\n    "hello": "world"\n  }\n})');
    });
  });

  it('should generate snippets for no files in form data', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'formdata',
        'formdata': [
          {
            'key': 'no file',
            'value': '',
            'type': 'file',
            'src': []
          },
          {
            'key': 'no src',
            'value': '',
            'type': 'file'
          },
          {
            'key': 'invalid src',
            'value': '',
            'type': 'file',
            'src': {}
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
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('data.append("no file", fileInput.files[0], "file")');
      expect(snippet).to.include('data.append("no src", fileInput.files[0], "file")');
      expect(snippet).to.include('data.append("invalid src", fileInput.files[0], "file")');
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
