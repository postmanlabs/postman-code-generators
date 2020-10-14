var convert = require('../../index').convert,
  expect = require('chai').expect,
  collection = require('./fixtures/collection.json'),
  sdk = require('postman-collection'),
  expectedSnippets = require('./fixtures/snippets.json');

// Disable check with expected snippets as we now have proper newman tests
describe.skip('Dart Converter', function () {
  describe('convert for different request types', function () {
    collection.item.forEach((item) => {
      it(item.name, function (done) {
        const request = new sdk.Request(item.request);
        convert(request, {}, (err, snippet) => {
          if (err) {
            expect.fail(null, null, err);
            return done();
          }
          expect(snippet).to.equal(expectedSnippets[item.name]);
          return done();
        });
      });
    });
  });
});
