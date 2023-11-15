var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),

  convert = require('../../lib/index').convert,
  mainCollection = require('../unit/fixtures/sample_collection.json'),
  snippetFixture;

/* global describe, it */
describe('jQuery converter', function () {
  before(function (done) {
    fs.readFile('./test/unit/fixtures/snippetFixtures.json', function (err, data) {
      if (err) {
        throw err;
      }
      snippetFixture = JSON.parse(data.toString());
      done();
    });
  });

  it('should throw an error if callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('js-jQuery~convert: Callback is not a function');
  });

  mainCollection.item.forEach(function (item) {
    it(item.name, function (done) {
      var request = new sdk.Request(item.request);
      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 100,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.equal(unescape(snippetFixture[item.name]));
      });
      done();
    });
  });

  it('should return snippet without errors when request object has no body property', function () {
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
        indentType: 'Space',
        indentCount: 4,
        requestTimeout: 100,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true
      };

    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('"url": "https://google.com"');
      expect(snippet).to.include('"method": "GET"');
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
      expect(snippet).to.contain('JSON.stringify({\n    "data": {\n      "hello": "world"\n    }\n  })');
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
      expect(snippet).to.include('"key_containing_whitespaces": "  value_containing_whitespaces  "');
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
      expect(snippet).to.include('"data": JSON.stringify({\n    "json": "Test-Test"\n  }');
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
      expect(snippet).to.include('query: "{ body { graphql } }"');
      expect(snippet).to.include('variables: {"variable_key":"variable_value"}');
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
      expect(snippet).to.include('"no file", fileInput.files[0], "file"');
      expect(snippet).to.include('"single file", fileInput.files[0], "test1.txt"');
      expect(snippet).to.include('"multiple files", fileInput.files[0], "test2.txt"');
      expect(snippet).to.include('"multiple files", fileInput.files[0], "test3.txt"');
      expect(snippet).to.include('"no src", fileInput.files[0], "file"');
      expect(snippet).to.include('"invalid src", fileInput.files[0], "file"');
    });
  });

  it('should generate valid snippet for multiple headers with same name', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [
        {
          'key': 'sample_key',
          'value': 'value1'
        },
        {
          'key': 'sample_key',
          'value': 'value2'
        }
      ],
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
      expect(snippet).to.include('"sample_key": ["value1", "value2"]');
      expect(snippet).to.not.include('"sample_key": "value1"');
      expect(snippet).to.not.include('"sample_key": "value2"');
    });
  });

  it('should generate snippet for form data params with no type key present', function () {
    var request = new sdk.Request({
      method: 'POST',
      header: [],
      url: {
        raw: 'https://postman-echo.com/post',
        protocol: 'https',
        host: [
          'postman-echo',
          'com'
        ],
        path: [
          'post'
        ]
      },
      body: {
        mode: 'formdata',
        formdata: [
          {
            key: 'sample_key',
            value: 'sample_value'
          }
        ]
      }
    });
    convert(request, {}, function (error, snippet) {
      expect(error).to.be.null;
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('form.append("sample_key", "sample_value")');
    });
  });
});
