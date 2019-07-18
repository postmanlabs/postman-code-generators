var expect = require('chai').expect,
  fs = require('fs'),
  sdk = require('postman-collection'),
  exec = require('shelljs').exec,
  newman = require('newman'),
  parallel = require('async').parallel,

  convert = require('../../lib/index').convert,
  mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * compiles and runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async call from mocha
 */
function runSnippet (codeSnippet, collection, done) {
  fs.writeFile('run.js', codeSnippet, function (err) {
    if (err) {
      expect.fail(null, null, err);
      return done();
    }

    var run = 'node run.js';

    //  step by step process for compile, run code snippet, then comparing its output with newman
    parallel([
      function (callback) {
        exec(run, function (err, stdout, stderr) {
          if (err) {
            return callback(err);
          }
          if (stderr) {
            return callback(stderr);
          }

          try {
            stdout = JSON.parse(stdout);
          }
          catch (e) {
            console.error(e);
          }
          return callback(null, stdout);
        });
      },
      function (callback) {
        newman.run({
          collection: collection
        }).on('request', function (err, summary) {
          if (err) {
            return callback(err);
          }

          var stdout = summary.response.stream.toString();
          try {
            stdout = JSON.parse(stdout);
          }
          catch (e) {
            console.error(e);
          }
          return callback(null, stdout);
        });
      }
    ], function (err, result) {
      if (err) {
        console.error(err);
        expect.fail(null, null, err);
      }
      else if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
        expect(result[0].trim()).to.equal(result[1].trim());
      }
      else {
        const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'clientIPAddress'],
          headersTodelete = [
            'accept-encoding',
            'user-agent',
            'cf-ray',
            'x-request-id',
            'x-request-start',
            'kong-request-id',
            'connect-time',
            'x-forwarded-for',
            'content-type',
            'content-length',
            'accept',
            'total-route-time',
            'cookie',
            'kong-cloud-request-id',
            'x-real-ip',
            'cache-control',
            'postman-token'
          ];
        if (result[0]) {
          propertiesTodelete.forEach(function (property) {
            delete result[0][property];
          });
          if (result[0].headers) {
            headersTodelete.forEach(function (property) {
              delete result[0].headers[property];
            });
          }
        }
        if (result[1]) {
          propertiesTodelete.forEach(function (property) {
            delete result[1][property];
          });
          if (result[1].headers) {
            headersTodelete.forEach(function (property) {
              delete result[1].headers[property];
            });
          }
        }
        expect(result[0]).deep.equal(result[1]);
      }
      return done();
    });
  });
}

describe('nodejs-native convert function', function () {
  mainCollection.item.forEach(function (item) {
    it(item.name, function (done) {
      var request = new sdk.Request(item.request),
        collection = {
          item: [
            {
              request: request.toJSON()
            }
          ]
        };
      convert(request, {indentCount: 2, indentType: 'Space'}, function (error, snippet) {
        if (error) {
          expect.fail(null, null, error);
          return;
        }
        //  disabling eslint for test file
        snippet = '/* eslint-disable */\n' + snippet;

        runSnippet(snippet, collection, done);
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
