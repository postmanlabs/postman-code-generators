var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert;

describe('nodejs-native convert function', function () {
  it('should sustain path variables when request has no path and has query params', function () {
    var request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'body': {},
        'url': {
          'raw': 'https://89c918b1-f4f8-4812-8e6c-69ecbeeb8409.mock.pstmn.io?query1=1&query2=2',
          'protocol': 'https',
          'host': [
            '89c918b1-f4f8-4812-8e6c-69ecbeeb8409',
            'mock',
            'pstmn',
            'io'
          ],
          'path': [],
          'query': [
            {
              'key': 'query1',
              'value': '1',
              'equals': true
            },
            {
              'key': 'query2',
              'value': '2',
              'equals': true
            }
          ]
        }
      }),
      options = {};
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('\'path\': \'/?query1=1&query2=2\'');
    });
  });

  it('should parse the url correctly even if the host and path are wrong in the url object',
    function () {
      var request = new sdk.Request({
        'method': 'GET',
        'body': {
          'mode': 'raw',
          'raw': ''
        },
        'url': {
          'path': [
            'hello'
          ],
          'host': [
            'https://example.com/path'
          ],
          'query': [],
          'variable': []
        }
      });
      convert(request, {}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('\'hostname\': \'example.com\',');
        expect(snippet).to.include('\'path\': \'/path/hello\',');
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
      expect(snippet).to.include('\'port\': 3000');
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
      expect(snippet).to.contain('Content-Type: application/json');
    });
  });

  it('should return snippet with ES6 features when ES6_enabled is set to true', function () {
    var request = new sdk.Request({
        'method': 'POST',
        'header': [
          {
            'key': 'lorem',
            'value': 'lorem_ipsum'
          }
        ],
        'url': {
          'raw': 'http://httpbin.org/post',
          'protocol': 'http',
          'host': [
            'httpbin',
            'org'
          ]
        },
        'body': {
          'mode': 'urlencoded',
          'urlencoded': {
            'title': 'foo-bar'
          }
        }
      }),
      snippetArray;
    convert(request, {'followRedirect': true, 'ES6_enabled': true}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      snippetArray = snippet.split('\n');
      expect(snippetArray[0]).to.equal('const http = require(\'follow-redirects\').http;');
      expect(snippetArray).to.include('const fs = require(\'fs\');');
      expect(snippetArray).to.include('const qs = require(\'querystring\');');
      expect(snippetArray).to.include('let options = {');
      expect(snippetArray).to.include('const req = http.request(options, (res) => {');
      expect(snippetArray).to.include('  let chunks = [];');
      expect(snippetArray).to.include('  res.on("data", (chunk) => {');
      expect(snippetArray).to.include('  res.on("end", (chunk) => {');
      expect(snippetArray).to.include('    let body = Buffer.concat(chunks);');
      expect(snippetArray).to.include('  res.on("error", (error) => {');
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
      expect(snippet).to.include('var postData = JSON.stringify({\n  "json": "Test-Test"\n})');
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
      expect(snippet).to.include('name=\\"no file\\"; filename=\\"file\\"');
      expect(snippet).to.include('name=\\"no src\\"; filename=\\"file\\"');
      expect(snippet).to.include('name=\\"invalid src\\"; filename=\\"file\\"');
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
      expect(snippet).to.include("'path': '/get?query1=b\\'b&query2=c%22c'");
    });
  });

  it('should generate valid snippet and should include appropriate variable name', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [],
      'body': {},
      'url': 'https://postman-echo.com/:action'
    });

    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include(':action');
    });
  });

  it('should generate valid snippet paths for single/double quotes in URL', function () {
    // url = https://a"b'c.com/'d/"e
    var request = new sdk.Request("https://a\"b'c.com/'d/\"e"); // eslint-disable-line quotes
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      // expect => 'hostname': 'a"b\'c.com'
      expect(snippet).to.include("'hostname': 'a\"b\\'c.com'"); // eslint-disable-line quotes
      // expect => 'path': '\'d/"e'
      expect(snippet).to.include("'path': '/\\'d/\"e'"); // eslint-disable-line quotes
    });
  });
});
