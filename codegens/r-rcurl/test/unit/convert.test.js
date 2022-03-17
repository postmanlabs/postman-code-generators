var expect = require('chai').expect,
  { convert } = require('../../index');
  // sdk = require('postman-collection'),
  // fs = require('fs'),
  // path = require('path');
  // collectionsPath = './fixtures';

describe('convert function', function () {

  // it('should convert a simple get request', function (done) {
  //   const collection = new sdk.Collection(JSON.parse(
  //     fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
  //   collection.items.members.forEach((item) => {
  //     convert(item.request, { asyncType: 'sync' }, function (err, snippet) {
  //       if (err) {
  //         console.error(err);
  //       }
  //       expect(snippet).to.not.be.empty;
  //     });
  //   });
  //   done();
  // });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('R-Rcurl~convert: Callback is not a function');
  });
});
