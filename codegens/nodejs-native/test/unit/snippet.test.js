var expect = require('chai').expect,
  sdk = require('postman-collection'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  async = require('async'),
  convert = require('../../lib/index').convert;

describe('nodejs-native convert function', function () {
  var options = {indentCount: 2, indentType: 'Space'},
    testConfig = {compileScript: null, runScript: 'node run.js', fileName: 'run.js'},
    header = '/* eslint-disable */\n';

  async.waterfall([
    function (next) {
      newmanTestUtil.generateSnippet(convert, options, function (error, snippets) {
        if (error) {
          expect.fail(null, null, error);
          return next(error);
        }

        return next(null, snippets);
      });
    },
    function (snippets, next) {
      snippets.forEach((item, index) => {
        it(item.name, function (done) {
          newmanTestUtil.runSnippet(header + item.snippet, index, testConfig,
            function (err, result) {
              if (err) {
                expect.fail(null, null, err);
              }
              if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
                expect(result[0].toString().trim()).to.include(result[1].toString().trim());
              }
              else {
                expect(result[0]).deep.equal(result[1]);
              }
              return done(null);
            });
        });
      });
      return next(null);
    }
  ]);

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
