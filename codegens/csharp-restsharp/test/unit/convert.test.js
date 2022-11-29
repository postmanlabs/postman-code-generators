var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json'),
  testCollection = require('./fixtures/testcollection/collectionForEdge.json'),
  getOptions = require('../../lib/index').getOptions,
  testResponseAsync = require('./fixtures/testResponseAsync.json'),
  testResponseJsonParams = require('./fixtures/testResponseJsonParams.json'),
  sanitize = require('../../lib/util').sanitize,
  sanitizeOptions = require('../../lib/util').sanitizeOptions;

describe('csharp restsharp function', function () {

  describe('csharp-restsharp convert function', function () {
    it('should return expected snippet - Async', function () {
      var request = new sdk.Request(mainCollection.item[4].request),
        options = {
          indentCount: 1,
          indentType: 'Tab',
          followRedirect: true,
          trimRequestBody: true
        };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).deep.equal(testResponseAsync.result);
      });
    });

    it('should return expected snippet json params', function () {
      var request = new sdk.Request(mainCollection.item[5].request),
        options = {
          indentCount: 1,
          indentType: 'Tab',
          followRedirect: true,
          trimRequestBody: true
        };

      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).deep.equal(testResponseJsonParams.result);
      });
    });
  });

  describe('convert function', function () {
    var request = new sdk.Request(testCollection.item[0].request),
      snippetArray,
      options = {
        includeBoilerplate: true,
        indentType: 'Space',
        indentCount: 2
      };

    it('should return snippet with boilerplate code given option', function () {
      convert(request, { includeBoilerplate: true }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include('using System;\nusing RestSharp;\nusing System.Threading;\nusing' +
        ' System.Threading.Tasks;\nnamespace HelloWorldApplication {\n');
        expect(snippet).to.include('static async Task Main(string[] args) {');
      });
    });

    it('should generate snippet with Space as an indent type with exact indent count', function () {
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('namespace HelloWorldApplication {')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal(' ');
            expect(snippetArray[i + 1].charAt(1)).to.equal(' ');
            expect(snippetArray[i + 1].charAt(2)).to.not.equal(' ');
          }
        }
      });
    });

    it('should add client timeout configurations when requestTimeout is set to non zero value', function () {
      convert(request, {requestTimeout: 5}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('MaxTimeout = 5');
      });
    });

    it('should add client FollowRedirects configurations when followRedirects is set to false', function () {
      convert(request, {followRedirect: false}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('FollowRedirects = false');
      });
    });

    it('should trim header keys and not trim header values', function () {
      var request = new sdk.Request({
        'method': 'GET',
        'header': [
          {
            'key': '  key_containing_whitespaces  ',
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
        expect(snippet).to.include('request.AddHeader("key_containing_whitespaces", ' +
        '"  value_containing_whitespaces  ")');
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
        expect(snippet).to.include('request.AddFile("no file", "/path/to/file"');
        expect(snippet).to.include('request.AddFile("no src", "/path/to/file"');
        expect(snippet).to.include('request.AddFile("invalid src", "/path/to/file"');
      });
    });

    it('should use client.UserAgent instead of AddHeader function', function () {
      const sampleUA = 'Safari/605.1.15',
        expectValue = `UserAgent = "${sampleUA}",`;

      var request = new sdk.Request({
        'method': 'GET',
        'header': [
          {
            'key': 'User-Agent',
            'value': sampleUA
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
        expect(snippet).to.include(expectValue);
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

  describe('sanitizeOptions function', function () {
    var defaultOptions = {},
      testOptions = {},
      sanitizedOptions;

    getOptions().forEach((option) => {
      defaultOptions[option.id] = {
        default: option.default,
        type: option.type
      };
      if (option.type === 'enum') {
        defaultOptions[option.id].availableOptions = option.availableOptions;
      }
    });

    it('should remove option not supported by module', function () {
      testOptions.randomName = 'random value';
      sanitizedOptions = sanitizeOptions(testOptions, getOptions());
      expect(sanitizedOptions).to.not.have.property('randomName');
    });

    it('should use defaults when option value type does not match with expected type', function () {
      testOptions = {};
      testOptions.indentCount = '5';
      testOptions.trimRequestBody = 'true';
      testOptions.indentType = 'tabSpace';
      sanitizedOptions = sanitizeOptions(testOptions, getOptions());
      expect(sanitizedOptions.indentCount).to.equal(defaultOptions.indentCount.default);
      expect(sanitizedOptions.indentType).to.equal(defaultOptions.indentType.default);
      expect(sanitizedOptions.trimRequestBody).to.equal(defaultOptions.trimRequestBody.default);
    });

    it('should use defaults when option type is valid but value is invalid', function () {
      testOptions = {};
      testOptions.indentCount = -1;
      testOptions.indentType = 'spaceTab';
      testOptions.requestTimeout = -3000;
      sanitizedOptions = sanitizeOptions(testOptions, getOptions());
      expect(sanitizedOptions.indentCount).to.equal(defaultOptions.indentCount.default);
      expect(sanitizedOptions.indentType).to.equal(defaultOptions.indentType.default);
      expect(sanitizedOptions.requestTimeout).to.equal(defaultOptions.requestTimeout.default);
    });

    it('should return the same object when default options are provided', function () {
      for (var id in defaultOptions) {
        if (defaultOptions.hasOwnProperty(id)) {
          testOptions[id] = defaultOptions[id].default;
        }
      }
      sanitizedOptions = sanitizeOptions(testOptions, getOptions());
      expect(sanitizedOptions).to.deep.equal(testOptions);
    });

    it('should return the same object when valid (but not necessarily defaults) options are provided', function () {
      testOptions = {};
      testOptions.indentType = 'Tab';
      testOptions.indentCount = 3;
      testOptions.requestTimeout = 3000;
      testOptions.trimRequestBody = true;
      testOptions.followRedirect = false;
      testOptions.includeBoilerplate = true;
      sanitizedOptions = sanitizeOptions(testOptions, getOptions());
      expect(sanitizedOptions).to.deep.equal(testOptions);
    });
  });

});
