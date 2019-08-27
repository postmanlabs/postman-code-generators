var expect = require('chai').expect,
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  convert = require('../../lib/index').convert;

describe('php-curl converter', function () {
  var testConfig = {
      runScript: 'php test/unit/fixtures/codesnippet.php',
      fileName: 'test/unit/fixtures/codesnippet.php',
      compileScript: null
    },
    options = {
      indentType: 'Space',
      indentCount: 4
    };

  async.waterfall([
    function (next) {
      newmanTestUtil.generateSnippet(convert, options, function (error, snippets) {
        if (error) {
          return next(error);
        }
        return next(null, snippets);
      });
    },
    function (snippets, next) {
      snippets.forEach((item, index) => {
        it(item.name, function (done) {
          newmanTestUtil.runSnippet(item.snippet, index, testConfig,
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

  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Curl~convert: Callback is not a function');
  });

});
