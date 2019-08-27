var expect = require('chai').expect,
  async = require('async'),
  newmanTestUtil = require('../../../../test/codegen/newman/newmanTestUtil'),
  convert = require('../../lib/index').convert;

describe('Python- Requests converter', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4
    },
    testConfig = {
      fileName: 'test/unit/fixtures/codesnippet.py',
      runScript: 'python test/unit/fixtures/codesnippet.py',
      compileScript: null
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
      .to.throw('Python-Requests~convert: Callback is not a function');
  });

});
