var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),

  convert = require('../../lib/index').convert,
  mainCollection = require('../unit/fixtures/sample_collection.json'),
  snippetFixture;

/* global describe, it */
describe('PHP HTTP_Request2 converter', function () {
  before(function (done) {
    fs.readFile('./test/unit/fixtures/snippetFixtures.json', function (err, data) {
      if (err) {
        throw err;
      }

      snippetFixture = JSON.parse(data.toString());
      done();
    });
  });
  it('should throw an error if callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('PHP-HttpRequest2-Converter: callback is not valid function');
  });

  mainCollection.item.forEach(function (item) {
    it(item.name, function (done) {
      var request = new sdk.Request(item.request);
      convert(request, {
        indentType: 'Space',
        indentCount: 2,
        trimRequestBody: false,
        followRedirect: true
      }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.equal((snippetFixture[item.name]));
      });
      done();
    });
  });
});
