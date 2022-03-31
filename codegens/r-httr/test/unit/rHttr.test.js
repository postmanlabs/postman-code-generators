var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),
  {
    convert,
    getSnippetHeaders,
    getSnippetPostPutOrPatchForm,
    getSnippetGetOrDeleteURL,
    getSnippetRequest,
    getIndentation
  } = require('../../lib/rHttr');

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[1].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a simple get request with timeout', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[1].request, { requestTimeout: 3 }, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      expect(snippet.includes('timeout(3)')).to.be.true;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with formdata', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[4].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with raw data', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[6].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with urlencoded', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[7].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with json with raw', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[8].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with javascript with raw', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[9].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with xml with raw', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[10].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should convert a post request with binary file', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[25].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.join(__dirname, './fixtures/snippet.r'), snippet);
    });
    // });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('R-Httr~convert: Callback is not a function');
  });
});

describe('getSnippetHeaders function', function () {

  it('should generate headers declaration snippet', function () {
    const expected = 'headers = c(\n  \'"1"\' = \'\\\'a\\\'\',\n  \'"2"\' = \'"b"\'\n)\n',
      res = getSnippetHeaders([{ key: '"1"', value: '\'a\''}, { key: '"2"', value: '"b"'}], '  ');
    expect(res).to.equal(expected);
  });

  it('should generate empty headers declaration snippet without headers', function () {
    const expected = '',
      res = getSnippetHeaders([ ], '  ');
    expect(res).to.equal(expected);
  });

  it('should generate headers declaration snippet with empty indentation', function () {
    const expected = 'headers = c(\n\'"1"\' = \'\\\'a\\\'\',\n\'"2"\' = \'"b"\'\n)\n',
      res = getSnippetHeaders([{ key: '"1"', value: '\'a\''}, { key: '"2"', value: '"b"'}], '');
    expect(res).to.equal(expected);
  });

});

describe('getSnippetPostPutOrPatchForm function', function () {

  it('should generate postForm snippet with params headers and post style', function () {
    const expected = 'res <- POST("https://postman-echo.com/post",' +
      ' body = body, add_headers(headers), encode = \'form\')\n',
      res = getSnippetPostPutOrPatchForm('https://postman-echo.com/post', true, true, 'POST', 'urlencoded');
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- POST("https://postman-echo.com/post"' +
      ', add_headers(headers), encode = \'form\')\n',
      res = getSnippetPostPutOrPatchForm(
        'https://postman-echo.com/post',
        false,
        true,
        'POST',
        'urlencoded'
      );
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- POST("https://postman-echo.com/post"' +
      ', add_headers(headers), encode = \'form\', timeout(3))\n',
      res = getSnippetPostPutOrPatchForm(
        'https://postman-echo.com/post',
        false,
        true,
        'POST',
        'urlencoded',
        3
      );
    expect(res).to.equal(expected);
  });

});

describe('getSnippetGetOrDeleteURL function', function () {

  it('should generate GET snippet with params headers', function () {
    const expected = 'res <- GET("https://postman-echo.com/headers", add_headers(headers))\n',
      res = getSnippetGetOrDeleteURL('https://postman-echo.com/headers', true, 'GET');
    expect(res).to.equal(expected);
  });

  it('should generate GET snippet without headers', function () {
    const expected = 'res <- GET("https://postman-echo.com/headers")\n',
      res = getSnippetGetOrDeleteURL('https://postman-echo.com/headers', false, 'GET');
    expect(res).to.equal(expected);
  });

  it('should generate GET snippet with timeout', function () {
    const expected = 'res <- GET("https://postman-echo.com/headers", timeout(3))\n',
      res = getSnippetGetOrDeleteURL('https://postman-echo.com/headers', false, 'GET', 3);
    expect(res).to.equal(expected);
  });
});

describe('getSnippetRequest function', function () {

  it('should generate snippet method GET with headers', function () {
    const expected = 'res <- GET("https://postman-echo.com/headers", add_headers(headers))\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'GET',
        hasParams: false,
        hasHeaders: true
      });
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET without headers', function () {
    const expected = 'res <- GET("https://postman-echo.com/headers")\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'GET',
        hasParams: false,
        hasHeaders: false
      });
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET without headers and timeout', function () {
    const expected = 'res <- GET("https://postman-echo.com/headers", timeout(3))\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'GET',
        hasParams: false,
        hasHeaders: false,
        requestTimeout: 3
      });
    expect(res).to.equal(expected);
  });

});

describe('getIndentation method', function () {
  it('should return two spaces', function () {
    const options = {
        indentType: 'Space',
        indentCount: 2
      },
      expected = '  ',
      result = getIndentation(options);
    expect(result).to.be.equal(expected);
  });
});
