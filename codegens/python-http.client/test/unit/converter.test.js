var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert,
  getOptions = require('../../lib/index').getOptions,
  parseBody = require('../../lib/util/parseBody'),
  sanitize = require('../../lib/util/sanitize').sanitize,
  mainCollection = require('../unit/fixtures/sample_collection.json');

describe('Python-http.client converter', function () {

  describe('convert function', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      snippetArray;

    const SINGLE_SPACE = ' ';

    it('should throw an error when callback is not function', function () {
      expect(function () { convert({}, {}); })
        .to.throw('Python-Http.Client~convert: Callback is not a function');
    });

    it('should generate snippet with default indent type and count for no options passed', function () {
      convert(request, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('headers ={')) {
            expect(snippetArray[i + 1].substr(0, 4)).to.equal(SINGLE_SPACE.repeat(4));
            expect(snippetArray[i + 1].charAt(4)).to.not.equal(SINGLE_SPACE);
          }
        }
      });
    });

    it('should generate snippet with Tab as an indent type', function () {
      convert(request, { indentType: 'Tab', indentCount: 1 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('headers ={')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal('\t');
            expect(snippetArray[i + 1].charAt(1)).to.not.equal('\t');
          }
        }
      });
    });

    it('should generate snippet with requestTimeout option', function () {
      var request = new sdk.Request(mainCollection.item[0].request);
      convert(request, { requestTimeout: 2000 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        expect(snippet).to.include(' timeout = 2000');
      });
    });

    it('should generate snippet when url is not provied', function () {
      var request = new sdk.Request({
        'name': 'test',
        'request': {
          'method': 'GET',
          'header': [],
          'url': {
            'raw': ''
          }
        },
        'response': []
      });
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('conn = http.client.HTTPSConnection("")');
      });
    });

    it('should generate snippet with correct indent when body mode is formdata', function () {
      var request = new sdk.Request({
        'method': 'GET',
        'header': [
          {
            'key': 'my-sample-header',
            'value': 'Lorem ipsum dolor sit amet'
          }
        ],
        'body': {
          'mode': 'formdata',
          'formdata': []
        },
        'url': {
          'raw': 'https://postman-echo.com/headers',
          'protocol': 'https',
          'host': [
            'postman-echo',
            'com'
          ],
          'path': [
            'headers'
          ]
        }
      });
      convert(request, { indentType: 'space', indentCount: 2}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('  \'Content-type\': \'multipart/form-data; boundary={}\'.format(boundary)');
      });
    });

    it('should add port in the options when host has port specified', function () {
      var request = new sdk.Request({
          'method': 'GET',
          'header': [],
          'url': {
            'raw': 'https://localhost:3000/getSelfBody',
            'protocol': 'https',
            'host': [
              'localhost'
            ],
            'port': '3000',
            'path': [
              'getSelfBody'
            ]
          }
        }),
        options = {};
      convert(request, options, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('conn = http.client.HTTPSConnection("localhost", 3000)');
      });
    });

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
        expect(snippet).to.include('\'key_containing_whitespaces\': \'  value_containing_whitespaces  \'');
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
        expect(snippet).to.include('name=no file');
        expect(snippet).to.include('name=no src');
        expect(snippet).to.include('name=invalid src');
        expect(snippet).to.include('with open(\'/path/to/file\')');
      });
    });

  });

  describe('parseBody function', function () {
    var requestEmptyFormdata = new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'formdata',
          'formdata': []
        }
      }),
      requestEmptyUrlencoded = new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'urlencoded',
          'urlencoded': []
        }
      }),
      requestEmptyRaw = new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': ''
        }
      });

    it('should parse body when body type is valid but body is empty', function () {
      expect(parseBody(requestEmptyFormdata.toJSON(), '\t', true)).to.be.a('string').to.equal('boundary = \'\'\npayload = \'\'\n'); // eslint-disable-line max-len
      expect(parseBody(requestEmptyUrlencoded.toJSON(), '\t', true)).to.be.a('string').to.equal('payload = \'\'\n'); // eslint-disable-line max-len
      expect(parseBody(requestEmptyRaw.toJSON(), '\t', true)).to.be.a('string').to.equal('payload = \'\'\n'); // eslint-disable-line max-len
    });

  });

  describe('getOptions function', function () {
    it('should return array of options for python-http-client converter', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'indentCount');
      expect(getOptions()[1]).to.have.property('id', 'indentType');
      expect(getOptions()[2]).to.have.property('id', 'requestTimeout');
      expect(getOptions()[3]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('sanitize function', function () {
    it('should handle invalid parameters', function () {
      expect(sanitize(123, 'raw', false)).to.equal('');
      expect(sanitize('inputString', '123', true)).to.equal('inputString');
    });
  });

});
