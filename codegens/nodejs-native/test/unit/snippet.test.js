var expect = require('chai').expect,
  sdk = require('postman-collection'),
  runSnippet = require('../../../../test/codegen/newman/newman.test').runSnippet,
  convert = require('../../lib/index').convert,
  mainCollection = require('../../../../test/codegen/newman/fixtures/testCollection.json');

describe('nodejs-native convert function', function () {
  mainCollection.item.forEach(function (item, index) {
    it(item.name, function (done) {
      var request = new sdk.Request(item.request);

      convert(request, {indentCount: 2, indentType: 'Space'}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        //  disabling eslint for test file
        snippet = '/* eslint-disable */\n' + snippet;

        runSnippet(snippet, index,
          {compileScript: null, runScript: 'node run.js', fileName: 'run.js'}, function (err, result) {
            if (err) {
              expect.fail(null, null, err);
            }
            if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
              expect(result[1].toString().trim()).to.include(result[0].toString().trim());
            }

            expect(result[0]).deep.equal(result[1]);
            return done();
          });
      });
    });
  });

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
});
