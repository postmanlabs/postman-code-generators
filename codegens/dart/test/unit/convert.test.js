var convert = require('../../index').convert,
  expect = require('chai').expect,
  collection = require('./fixtures/collection.json'),
  sdk = require('postman-collection'),
  expectedSnippets = require('./fixtures/snippets.json');

describe('Dart Converter', function () {
  describe('convert for different request types', function () {
    collection.item.forEach((item) => {
      it(item.name, function (done) {
        const request = new sdk.Request(item.request);
        convert(request, {}, (err, snippet) => {
          if (err) {
            expect.fail(null, null, err);
            return done();
          }
          console.log('snippet:\n' + snippet);
          console.log('expectedSnippets[item.name]: \n' + expectedSnippets[item.name]);
          expect(snippet).to.equal(expectedSnippets[item.name]);
          return done();
        });
      });
    });
  });
});
