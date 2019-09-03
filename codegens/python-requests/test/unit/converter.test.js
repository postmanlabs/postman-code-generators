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

  it('should not have allow_redirects=False twice in generated snippet when' +
  ' followRedirect option is set as false', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      options = { followRedirect: false, requestTimeout: 0 };
    convert(request, options, function (err, snippet) {
      if (err) {
        expect.fail(null, null, err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.not.include('allow_redirects = False, allow_redirects = false');
    });
  });

  it('should have correct boolean value for allow_redirects(False, uppercased F) in generated snippet when' +
  ' followRedirect option is set as false', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      options = { followRedirect: false };
    convert(request, options, function (err, snippet) {
      if (err) {
        expect.fail(null, null, err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('allow_redirects = False');
      expect(snippet).to.not.include('allow_redirects = false');
    });
  });

});
