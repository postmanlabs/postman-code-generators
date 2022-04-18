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

  it('should convert requests with ignore warnigns options', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { ignoreWarnings: true}, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('options(warn=-1)');
      });
    });
    done();
  });

  it('should convert requests with ignore warnigns options in false', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { ignoreWarnings: false}, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('options(warn=-1)');
      });
    });
    done();
  });

  it('should convert requests with ignore warnigns options not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, {}, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('options(warn=-1)');
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

  it('should convert requests with requestTimeout option not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('\'timeout\'');
      });
    });
    done();
  });

  it('should convert requests with requestTimeout option set as 0', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { requestTimeout: 0 }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('\'timeout\' => 0');
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
        expect(snippet).to.not.include('followlocation = FALSE');
      });
    });
    done();
  });

  it('should convert requests with followRedirect option set as true', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { followRedirect: true }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('followlocation = TRUE');
      });
    });
    done();
  });

  it('should convert requests with followRedirect option not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('followlocation');
      });
    });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('R-Rcurl~convert: Callback is not a function');
  });
});
