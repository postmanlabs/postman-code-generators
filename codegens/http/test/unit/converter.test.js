let testCollection = require('../resources/test-collection.json'),
  expectedResults = require('../resources/expected-http-messages.json'),
  { convert } = require('../../index'),
  { expect } = require('chai'),
  _ = require('lodash'),
  Request = require('postman-collection').Request,

  requests = testCollection.item;

describe('Converter test', function () {

  _.forEach(requests, function (r, ind) {
    let testRequest = new Request(r.request);
    convert(testRequest, {trimRequestBody: false}, function (err, snippet) {
      if (err) {
        console.log('Something went wrong while converting the request');
      }
      it(`should generate appropriate http message for: ${r.name}`, function () {
        expect(snippet).to.equal(expectedResults.result[ind]);
      });
    });
  });

  it('should trim header keys and not trim header values', function () {
    var request = new Request({
      'method': 'GET',
      'header': [
        {
          'key': '  key_containing_whitespaces  ',
          'value': '  value_containing_whitespaces  '
        }
      ],
      'body': {
        'mode': 'raw',
        'raw': ''
      },
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
      // one extra space in matching the output because we add key:<space>value in the snippet
      expect(snippet).to.include('key_containing_whitespaces:   value_containing_whitespaces  ');
    });
  });

  it('should include graphql body in the snippet', function () {
    var request = new Request({
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
      expect(snippet).to.include('{"query":"{ body { graphql } }",');
      expect(snippet).to.include('"variables":{"variable_key":"variable_value"}}');
    });
  });

  it('should generate snippets(not error out) for requests with no body', function () {
    var request = new Request({
      'method': 'GET',
      'header': [
        {
          'key': 'Content-Type',
          'value': 'text/plain'
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
    });
  });

  it('should generate snippets(not error out) for requests with multiple/no file in formdata', function () {
    var request = new Request({
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
      expect(snippet).to.include('name="single file"; filename="test1.txt"');
      expect(snippet).to.include('name="multiple files"; filename="test2.txt"');
      expect(snippet).to.include('name="multiple files"; filename="test3.txt"');
      expect(snippet).to.include('name="no file"; filename="file"');
      expect(snippet).to.include('name="no src"; filename="file"');
      expect(snippet).to.include('name="invalid src"; filename="file"');
    });
  });

  it('should generate valid snippet and should include appropriate variable name', function () {
    var request = new Request({
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
});

describe('Converter test using options.trimRequestBody', function () {
  let requestModeRaw = requests[6], // request.body.mode: raw
    requestModeFormData = requests[4], // request.body.mode: formdata
    requestModeUrlEncoded = requests[7], // request.body.mode: urlencoded
    testRequestModeRaw = new Request(requestModeRaw.request),
    testRequestModeFormData = new Request(requestModeFormData.request),
    testRequestModeUrlEncoded = new Request(requestModeUrlEncoded.request);

  convert(testRequestModeRaw, { trimRequestBody: true}, function (err, snippet) {
    if (err) {
      console.log('Something went wrong while converting the request');
    }

    it(`should generate appropriate http message using options.trimRequestBody: true, for: ${requestModeRaw.name}`,
      function () {
        expect(snippet).to.equal(expectedResults.trimmedResult[0]);
      });
  });
  convert(testRequestModeFormData, { trimRequestBody: true}, function (err, snippet) {
    if (err) {
      console.log('Something went wrong while converting the request');
    }

    it(`should generate appropriate http message using options.trimRequestBody: true, for: ${requestModeFormData.name}`,
      function () {
        expect(snippet).to.equal(expectedResults.trimmedResult[1]);
      });
  });
  convert(testRequestModeUrlEncoded, { trimRequestBody: true}, function (err, snippet) {
    if (err) {
      console.log('Something went wrong while converting the request');
    }

    it('should generate appropriate http message using options.trimRequestBody: true, for:' +
      `${requestModeUrlEncoded.name}`,
    function () {
      expect(snippet).to.equal(expectedResults.trimmedResult[2]);
    });
  });
});
