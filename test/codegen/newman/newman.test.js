var fs = require('fs'),
  exec = require('shelljs').exec,
  // sdk = require('postman-collection'),
  newmanResponses = require('./newmanResponses.json'),
  // testCollection = require('./fixtures/testCollection.json'),
  async = require('async');

module.exports = {
  /**
   * compiles and runs codesnippet then compare it with newman output
   *
   * @param {String} codeSnippet - code snippet that needed to run using C#
   * @param {Integer} index
   * @param {Integer} testConfig
   * @param {Function} callback - callback for async calls
   */
  runSnippet: function (codeSnippet, index, testConfig, callback) {
    if (testConfig.fileName) {
      fs.writeFileSync(testConfig.fileName, codeSnippet);
    }
    console.log(index);
    //  bash command string for compiling codeSnippet
    var compile = testConfig.compileScript ? testConfig.compileScript : null,
      //  bash command stirng for run compiled file file
      run = testConfig.runScript ? testConfig.runScript : codeSnippet;

    //  step by step process for compile, run code snippet, then comparing its output with newman
    async.waterfall([
      function compileCodeSnippet (next) {
        if (compile) {
          return exec(compile, function (err, stdout, stderr) {
            if (err) {
              return next(JSON.stringify({
                error: err,
                message: 'Compile error'
              }));
            }
            if (stderr) {
              return next(JSON.stringify({
                stderr: stderr,
                message: 'Compile error'
              }));
            }
            console.log(stdout);
            return next(null);
          });
        }
        return next(null);
      },

      function runCodeSnippet (next) {
        if (run) {
          return exec(run, function (err, stdout, stderr) {

            if (err) {
              return next(err);
            }
            if (stderr) {
              return next(stderr);
            }
            try {
              stdout = JSON.parse(stdout);
            }
            catch (e) {
              console.error(e);
            }
            return next(null, stdout);
          });
        }
      }
    ], function (err, response) {
      var result = [response, newmanResponses[index]];

      if (err) {
        return callback(err);
      }
      else if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
        return callback(null, result);
      }
      const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'clientIPAddress'],
        headersTodelete = [
          'accept-encoding',
          'user-agent',
          'cf-ray',
          'x-real-ip',
          'x-request-id',
          'kong-request-id',
          'x-request-start',
          'connect-time',
          'x-forwarded-for',
          'content-type',
          'content-length',
          'accept',
          'total-route-time',
          'cookie',
          'kong-cloud-request-id',
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
      return callback(null, result);

    });
  }

  // generateSnippet: function (convert, options, callback) {
  //   // check if convert is a function, and options is an object

  //   async.map(testCollection.item, function (item, cb) {
  //     var request = new sdk.Request(item.request);

  //     convert(request, options, function (err, snippet) {
  //       if (err) {
  //         return cb(err);
  //       }

  //       return cb(null, snippet);
  //     });
  //   }, function (err, snippets) {
  //     if (err) {
  //       return callback(err);
  //     }

  //     return callback(null, snippets);
  //   });
  // }
};
