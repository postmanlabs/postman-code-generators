var expect = require('chai').expect,
  sdk = require('postman-collection'),
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('nodejs-native convert function', function () {
  var options = {indentCount: 2, indentType: 'Space'},
    testConfig = {
      headerSnippet: '/* eslint-disable */\n',
      compileScript: null,
      runScript: 'node run.js',
      fileName: 'run.js'
    };

  runNewmanTest(convert, options, testConfig);

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
});
