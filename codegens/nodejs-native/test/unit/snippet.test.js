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
      expect(snippet).to.include('var postData = JSON.stringify({"json":"Test-Test"})');
    });
  });
});
