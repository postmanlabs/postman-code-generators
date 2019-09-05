var expect = require('chai').expect,
  path = require('path'),
  sdk = require('postman-collection'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  async = require('async'),
  convert = require('../../lib/index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json'),
  testCollection = require('./fixtures/testcollection/collectionForEdge.json'),
  getOptions = require('../../lib/index').getOptions,
  testResponse = require('./fixtures/testresponse.json'),
  sanitize = require('../../lib/util').sanitize,
  sanitizeOptions = require('../../lib/util').sanitizeOptions;

describe('csharp restsharp function', function () {
  describe('convert for different request types', function () {
    var headerSnippet = 'using System;\n' +
                            'using RestSharp;\n' +
                            'namespace HelloWorldApplication {\n' +
                            'class HelloWorld {\n' +
                            'static void Main(string[] args) {\n',
      footerSnippet = '}\n}\n}\n',
      depedenciesPath = path.resolve(__dirname, 'fixtures/dependencies'),
      testConfig = {
        compileScript: `mcs -reference:${depedenciesPath}/RestSharp.dll` +
        ` -out:${depedenciesPath}/main.exe ${depedenciesPath}/main.cs`,
        runScript: `mono  ${depedenciesPath}/main.exe`,
        fileName: `${depedenciesPath}/main.cs`
      },
      options = {
        indentCount: 1,
        indentType: 'Tab'
      };
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
            newmanTestUtil.runSnippet(headerSnippet + item.snippet + footerSnippet, index, testConfig,
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

  describe('csharp-restsharp convert function', function () {
    it('should return expected snippet', function () {
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
        expect(snippet).deep.equal(testResponse.result);
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
        expect(snippet).to.include('using System;\nusing RestSharp;\nnamespace HelloWorldApplication {\n');
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
        expect(snippet).to.include('client.Timeout = 5');
      });
    });

    it('should add client FollowRedirects configurations when followRedirects is set to false', function () {
      convert(request, {followRedirect: false}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('client.FollowRedirects = false');
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
