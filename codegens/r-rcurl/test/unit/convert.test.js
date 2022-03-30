var expect = require('chai').expect,
  { convert } = require('../../index'),
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path');

describe('convert function', function () {
  const collection = new sdk.Collection(JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));

  it('should convert requests with default options', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
      });
    });
    done();
  });

  it('should convert requests with requestTimeout option set as 500', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { requestTimeout: 500 }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('timeout.ms = 500');
      });
    });
    done();
  });

  it('should convert requests with followRedirect option set as false', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { followRedirect: false }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('followlocation = FALSE');
      });
    });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('R-Rcurl~convert: Callback is not a function');
  });
});
