var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert,
  getOptions = require('../../lib/index').getOptions,
  sanitize = require('../../lib/util').sanitize,
  parseBody = require('../../lib/parseRequest').parseBody,
  mainCollection = require('./fixtures/testcollection/collection.json');

describe('nodejs unirest convert function', function () {

  describe('Convert function', function () {
    var request, reqObject, options, snippetArray, line_no;

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
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i] === '\t.headers({') { line_no = i + 1; }
        }
        expect(snippetArray[line_no].charAt(0)).to.equal('\t');
        expect(snippetArray[line_no].charAt(1)).to.equal('\t');
      });
    });

    it('should return snippet with timeout function when timeout is set to non zero', function () {
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
        expect(snippet).to.include('.timeout(1000)');
      });
    });

    it('should use JSON.parse if the content-type is application/vnd.api+json', function () {
      request = new sdk.Request({
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
        expect(snippet).to.contain('JSON.stringify({\n    "data": {\n      "hello": "world"\n    }\n  })');
      });
    });

    it('should return snippet with ES6 features', function () {
      request = new sdk.Request(mainCollection.item[0].request);
      options = {
        ES6_enabled: true
      };
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.be.a('string');
        snippetArray = snippet.split('\n');
        expect(snippetArray[0]).to.equal('const unirest = require(\'unirest\');');
        expect(snippetArray).to.include(`const req = unirest('${mainCollection.item[0].request.method}', ` +
        `'${mainCollection.item[0].request.url.raw}')`);
        expect(snippetArray).to.include('  .end((res) => { ');
      });
    });

    it('should return snippet with followRedirect function having ' +
        'parameter false for no follow redirect', function () {
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
        expect(snippet).to.include('.followRedirect(false)');
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
        expect(snippet).to.not.include('.headers');
        expect(snippet).to.not.include('.send');
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
        expect(snippet).to.include('\'key_containing_whitespaces\': \'  value_containing_whitespaces  \'');
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
        expect(snippet).to.include('.send(JSON.stringify({\n    "json": "Test-Test"\n  }))');
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
        expect(snippet).to.include('.attach(\'file\', \'/path/to/file\')');
      });
    });

    it('should generate valid snippet for single/double quotes in url', function () {
      var request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'https://postman-echo.com/get?query1=b\'b&query2=c"c',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'get'
          ],
          'query': [
            {
              'key': 'query1',
              'value': "b'b" // eslint-disable-line quotes
            },
            {
              'key': 'query2',
              'value': 'c"c'
            }
          ]
        }
      });
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        // eslint-disable-next-line quotes
        expect(snippet).to.include("'https://postman-echo.com/get?query1=b\\'b&query2=c\"c'");
      });
    });
  });

  describe('getOptions function', function () {

    it('should return an array of specific options', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'indentCount');
      expect(getOptions()[1]).to.have.property('id', 'indentType');
      expect(getOptions()[2]).to.have.property('id', 'requestTimeout');
      expect(getOptions()[3]).to.have.property('id', 'followRedirect');
      expect(getOptions()[4]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('parseRequest function', function () {

    it('should return empty string for empty body', function () {
      expect(parseBody(null, ' ', false)).to.equal('');
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
