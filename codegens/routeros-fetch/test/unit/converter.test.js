let testCollection = require('../resources/test-collection.json'),
  expectedResults = require('../resources/expected-http-messages.json'),
  errorCollection = require('../resources/error-collection.json'),
  { convert } = require('../../index'),
  { expect } = require('chai'),
  _ = require('lodash'),
  Request = require('postman-collection').Request,
  requests = testCollection.item;

describe('Converter test', function () {
  _.forEach(requests, function (r, ind) {
    let testRequest = new Request(r.request);
    convert(
      testRequest,
      { style: 'plain', commentary: 'errors' },
      function (err, snippet) {
        if (err) {
          console.log(`${snippet}`);
          console.log(testRequest);
          console.log('');
        }

        it(`should generate appropriate http message for: ${r.name}`, function () {
          expect(snippet).to.equal(expectedResults.result[ind]);
        });
      }
    );
  });

  it('should parse the url correctly even if the host and path are wrong in the url object', function () {
    var request = new Request({
      method: 'GET',
      body: {
        mode: 'raw',
        raw: ''
      },
      url: {
        path: ['hello'],
        host: ['https://example.com/path'],
        query: [],
        variable: []
      }
    });
    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('http-method=get');
        expect(snippet).to.include('url="https://example.com/hello');
      }
    );
  });

  it('should include graphql body in the snippet', function () {
    var request = new Request({
      method: 'POST',
      header: [],
      body: {
        mode: 'graphql',
        graphql: {
          query: '{ body { graphql } }',
          variables: '{"variable_key": "variable_value"}'
        }
      },
      url: {
        raw: 'http://postman-echo.com/post',
        protocol: 'http',
        host: ['postman-echo', 'com'],
        path: ['post']
      }
    });
    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include(
          'http-data="{\\"query\\":\\"{ body { graphql } }\\",'
        );
        expect(snippet).to.include(
          '\\"variables\\":{\\"variable_key\\":\\"variable_value\\"}}"'
        );
      }
    );
  });

  it('should generate snippets(not error out) for requests with no body', function () {
    var request = new Request({
      method: 'GET',
      header: [
        {
          key: 'Content-Type',
          value: 'text/plain'
        }
      ],
      url: {
        raw: 'https://postman-echo.com/get',
        protocol: 'https',
        host: ['postman-echo', 'com'],
        path: ['get']
      }
    });
    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
      }
    );
  });

  it('should generate snippets(not error out) for requests with multiple/no file in formdata', function () {
    var request = new Request({
      method: 'POST',
      header: [],
      body: {
        mode: 'formdata',
        formdata: [
          {
            key: 'no file',
            value: '',
            type: 'file',
            src: []
          },
          {
            key: 'single file',
            value: '',
            type: 'file',
            src: '/test1.txt'
          },
          {
            key: 'multiple files',
            value: '',
            type: 'file',
            src: ['/test2.txt', '/test3.txt']
          },
          {
            key: 'no src',
            value: '',
            type: 'file'
          },
          {
            key: 'invalid src',
            value: '',
            type: 'file',
            src: {}
          }
        ]
      },
      url: {
        raw: 'https://postman-echo.com/post',
        protocol: 'https',
        host: ['postman-echo', 'com'],
        path: ['post']
      }
    });

    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('name=\\"single file\\"; filename=\\"test1.txt\\"');
        expect(snippet).to.include(
          'name=\\"multiple files\\"; filename=\\"test2.txt\\"'
        );
        expect(snippet).to.include(
          'name=\\"multiple files\\"; filename=\\"test3.txt\\"'
        );
        expect(snippet).to.include('name=\\"no file\\"; filename=\\"file\\"');
        expect(snippet).to.include('name=\\"no src\\"; filename=\\"file\\"');
        expect(snippet).to.include('name=\\"invalid src\\"; filename=\\"file\\"');
      }
    );
  });

  it('should generate valid snippet and should include appropriate variable name', function () {
    var request = new Request({
      method: 'GET',
      header: [],
      body: {},
      url: 'https://postman-echo.com/:action'
    });

    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include(':action');
      }
    );
  });

  it('should generate a valid path even if the url contains unresolved variables', function () {
    var request = new Request({
      method: 'GET',
      url: {
        host: ['{{variable}}'],
        path: ['{{path}}']
      }
    });

    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }
        expect(snippet).to.be.a('string');
        expect(snippet).to.include('url="http://{{variable}}/{{path}}"');
      }
    );
  });

  it('should add content type if formdata field contains a content-type', function () {
    var request = new Request({
      method: 'POST',
      body: {
        mode: 'formdata',
        formdata: [
          {
            key: 'json',
            value: '{"hello": "world"}',
            contentType: 'application/json',
            type: 'text'
          }
        ]
      },
      url: {
        raw: 'http://postman-echo.com/post',
        host: ['postman-echo', 'com'],
        path: ['post']
      }
    });

    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.be.a('string');
        expect(snippet).to.contain('Content-Type: application/json');
      }
    );
  });

  it('should not add extra newlines if there is no body or header present', function () {
    var request = new Request({
      method: 'GET',
      url: {
        host: ['example', 'com']
      }
    });

    convert(
      request,
      { style: 'plain', commentary: 'none' },
      function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
        }

        expect(snippet).to.equal('/tool/fetch http-method=get url="http://example.com"');
      }
    );
  });
});

describe('Error request collection tests', function () {
  _.forEach(errorCollection.item, function (r) {
    let testRequest = new Request(r.request);
    convert(
      testRequest,
      { style: 'plain', commentary: 'errors' },
      function (err, snippet) {
        if (err) {
          console.log(`${snippet}`);
          console.log(testRequest);
          console.log('');
        }

        it(`should generate appropriate http message for: ${r.name}`, function () {
          expect(snippet).to.contain('PROBLEMS');
        });
      }
    );
  });
});


describe('Verify commentary option', function () {
  let testRequest = new Request(requests[7].request);
  convert(
    testRequest,
    { style: 'plain', commentary: 'all' },
    function (err, snippet) {
      if (err) {
        console.log(`${snippet}`);
        console.log(testRequest);
        console.log('');
      }
      it('should generate tip when commentary=all', function () {
        expect(snippet).to.contain('TIP');
      });
    }
  );
  convert(
    testRequest,
    { style: 'plain', commentary: 'errors' },
    function (err, snippet) {
      if (err) {
        console.log(`${snippet}`);
        console.log(testRequest);
        console.log('');
      }
      it('should NOT generate tip when commentary=errors', function () {
        expect(snippet).to.not.contain('TIP');
      });
    }
  );
  convert(
    testRequest,
    { style: 'plain', commentary: 'none' },
    function (err, snippet) {
      if (err) {
        console.log(`${snippet}`);
        console.log(testRequest);
        console.log('');
      }
      it('should NOT generate tip when commentary=none', function () {
        expect(snippet).to.not.contain('TIP');
      });
    }
  );
});

describe('Converter test using style options', function () {
  let requestModeRaw = requests[6], // request.body.mode: raw
    requestModeFormData = requests[4], // request.body.mode: formdata
    requestModeUrlEncoded = requests[7], // request.body.mode: urlencoded
    testRequestModeRaw = new Request(requestModeRaw.request),
    testRequestModeFormData = new Request(requestModeFormData.request),
    testRequestModeUrlEncoded = new Request(requestModeUrlEncoded.request);

  [ 'plain',
    'outputToConsole',
    'outputToVariable',
    'outputToVariableWithHeaders',
    'outputToFile'
  ].forEach((style) => {
    convert(
      testRequestModeRaw,
      { style: style, commentary: 'all' },
      function (err, snippet) {
        if (err) {
          console.log('Something went wrong while converting the request');
        }
        it('should generate appropriate http message using options.style: ' +
          `${style} - ${requestModeRaw.name}`, function () {
          expect(snippet).to.contain(expectedResults.result[6]);
        });
      }
    );
    convert(testRequestModeFormData, { style: style, commentary: 'all' }, function (err, snippet) {
      if (err) {
        console.log('Something went wrong while converting the request');
      }
      it('should generate appropriate http message using options.style: ' +
        `${style} - ${requestModeFormData.name}`, function () {
        expect(snippet).to.contain(expectedResults.result[4]);
      });
    });
    convert(
      testRequestModeUrlEncoded,
      { style: style, commentary: 'all' },
      function (err, snippet) {
        if (err) {
          console.log('Something went wrong while converting the request');
        }
        it(
          `should generate appropriate http message using options.style: ${style} - ` +
          `${requestModeUrlEncoded.name}`,
          function () {
            expect(snippet).to.contain(expectedResults.result[7]);
          }
        );
      }
    );
  });
});
