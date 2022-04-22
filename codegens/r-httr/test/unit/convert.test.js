var expect = require('chai').expect,
  { convert } = require('../../index'),
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path');


describe('convert function', function () {

  it('should convert a simple get request', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[1].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a simple get request with timeout', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[1].request, { requestTimeout: 3 }, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      expect(snippet.includes('timeout(3)')).to.be.true;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with formdata', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[4].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with raw data', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[6].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with urlencoded', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[7].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with json with raw', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[8].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with javascript with raw', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[9].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with xml with raw', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[10].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should convert a post request with binary file', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    convert(collection.items.members[25].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('R-Httr~convert: Callback is not a function');
  });
});
