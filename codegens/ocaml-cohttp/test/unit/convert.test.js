var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../index').convert,
  getOptions = require('../../index').getOptions,
  sanitize = require('../../lib/util').sanitize,
  mainCollection = require('./fixtures/testcollection/collection.json');

describe('Ocaml unit tests', function () {

  describe('convert function', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      snippetArray;

    const SINGLE_SPACE = ' ';

    it('should generate snippet with default options given no options', function () {
      convert(request, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('let reqBody = ')) {
            expect(snippetArray[i + 1].substr(0, 2)).to.equal(SINGLE_SPACE.repeat(2));
            expect(snippetArray[i + 1].charAt(2)).to.not.equal(SINGLE_SPACE);
          }
        }
      });
    });

    it('should generate snippet with Space as an indent type with exact indent count', function () {
      convert(request, { indentType: 'Space', indentCount: 2 }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('let reqBody = ')) {
            expect(snippetArray[i + 1].substr(0, 2)).to.equal(SINGLE_SPACE.repeat(2));
            expect(snippetArray[i + 1].charAt(2)).to.not.equal(SINGLE_SPACE);
          }
        }
      });
    });

    // By default takes 2 spaces as indentCount and indentType
    it('should generate snippet with default indent count for absent option indentCount', function () {
      convert(request, { indentType: 'Space' }, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        snippetArray = snippet.split('\n');
        for (var i = 0; i < snippetArray.length; i++) {
          if (snippetArray[i].startsWith('let reqBody = ')) {
            expect(snippetArray[i + 1].charAt(0)).to.equal(' ');
            expect(snippetArray[i + 1].charAt(1)).to.equal(' ');
          }
        }
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
        expect(snippet).to.include('Header.add h "key_containing_whitespaces" "  value_containing_whitespaces  "');
      });
    });

    it('should add content type if formdata field contains a content-type', function () {
      var request = new sdk.Request({
        'method': 'POST',
        'body': {
          'mode': 'formdata',
          'formdata': [
            {
              'key': 'json',
              'value': '{"hello": "world"}',
              'contentType': 'application/json',
              'type': 'text'
            }
          ]
        },
        'url': {
          'raw': 'http://postman-echo.com/post',
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
        expect(snippet).to.contain('[| ("name", "json"); ("value", "{\\"hello\\": \\"world\\"}"); ("contentType", "application/json") |]'); // eslint-disable-line max-len
        expect(snippet).to.contain('postData := if Array.length parameters.(x) == 3 then (');
        expect(snippet).to.contain('let (_, contentType) = parameters.(x).(2) in');
        expect(snippet).to.contain('!postData ^ accum ^ "\\r\\n" ^ "Content-Type: " ^ contentType');
      });
    });


    it('should include graphql body in the snippet', function () {
      var request = new sdk.Request({
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'graphql',
          'graphql': {
            'query': '{ body { graphql } }',
            'variables': '{"variable_key": "variable_value"}'
          }
        },
        'url': {
          'raw': 'http://postman-echo.com/post',
          'protocol': 'http',
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
        expect(snippet).to.include('\\"query\\":\\"{ body { graphql } }\\"');
        expect(snippet).to.include('\\"variables\\":{\\"variable_key\\":\\"variable_value\\"}');
      });
    });

    it('should generate snippets(not error out) for requests with multiple/no file in formdata', function () {
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
              'key': 'single file',
              'value': '',
              'type': 'file',
              'src': '/test1.txt'
            },
            {
              'key': 'multiple files',
              'value': '',
              'type': 'file',
              'src': ['/test2.txt',
                '/test3.txt']
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
        expect(snippet).to.include('("name", "no file"); ("fileName", "/path/to/file")');
        expect(snippet).to.include('("name", "single file"); ("fileName", "/test1.txt")');
        expect(snippet).to.include('("name", "multiple files"); ("fileName", "/test2.txt")');
        expect(snippet).to.include('("name", "multiple files"); ("fileName", "/test3.txt")');
        expect(snippet).to.include('("name", "no src"); ("fileName", "/path/to/file")');
        expect(snippet).to.include('("name", "invalid src"); ("fileName", "/path/to/file")');
      });
    });
  });

  describe('getOptions function', function () {
    it('should return array of options for swift-urlsession converter', function () {
      expect(getOptions()).to.be.an('array');
    });

    it('should return all the valid options', function () {
      expect(getOptions()[0]).to.have.property('id', 'indentCount');
      expect(getOptions()[1]).to.have.property('id', 'indentType');
      expect(getOptions()[2]).to.have.property('id', 'trimRequestBody');
    });
  });

  describe('sanitize function', function () {
    it('should handle invalid parameters', function () {
      expect(sanitize(123, 'raw', false)).to.equal('');
      expect(sanitize('inputString', 123, true)).to.equal('inputString');
    });
  });
});
