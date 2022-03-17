var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),
  {
    convert,
    getSnippetHeaders,
    getSnippetPostForm,
    getSnippetGetURL,
    getSnippetRequest
  } = require('../../lib/rRcurl');

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
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

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('R-Rcurl~convert: Callback is not a function');
  });
});

describe('getSnippetHeaders function', function () {

  it('should generate headers declaration snippet', function () {
    const expected = 'headers = c(\n  "\\"1\\"" = "\'a\'",\n  "\\"2\\"" = "\\"b\\""\n)\n',
      res = getSnippetHeaders([{ key: '"1"', value: '\'a\''}, { key: '"2"', value: '"b"'}], '  ');
    expect(res).to.equal(expected);
  });

  it('should generate empty headers declaration snippet without headers', function () {
    const expected = '',
      res = getSnippetHeaders([ ], '  ');
    expect(res).to.equal(expected);
  });

  it('should generate headers declaration snippet with empty indentation', function () {
    const expected = 'headers = c(\n"\\"1\\"" = "\'a\'",\n"\\"2\\"" = "\\"b\\""\n)\n',
      res = getSnippetHeaders([{ key: '"1"', value: '\'a\''}, { key: '"2"', value: '"b"'}], '');
    expect(res).to.equal(expected);
  });

});

describe('getSnippetPostForm function', function () {

  it('should generate postForm snippet with params headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = p, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostForm('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      '  .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostForm('https://postman-echo.com/post', 'post', false, true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without headers with params and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = p, style = "post")\n',
      res = getSnippetPostForm('https://postman-echo.com/post', 'post', true, false);
    expect(res).to.equal(expected);
  });

});

describe('getSnippetGetURL function', function () {

  it('should generate postForm snippet with params headers and post style', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers", httpheader = headers)\n',
      res = getSnippetGetURL('https://postman-echo.com/headers', true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet with params headers and post style', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers")\n',
      res = getSnippetGetURL('https://postman-echo.com/headers', false);
    expect(res).to.equal(expected);
  });
});

describe('getSnippetRequest function', function () {

  it('should generate snippet method GET with headers', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers", httpheader = headers)\n',
      res = getSnippetRequest('https://postman-echo.com/headers', 'GET', '', false, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET without headers', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers")\n',
      res = getSnippetRequest('https://postman-echo.com/headers', 'GET', '', false, false);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = p, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostForm('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params headers and httppost style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = p, .opts=list(httpheader=headers), style = "httpost")\n',
      res = getSnippetPostForm('https://postman-echo.com/post', 'httpost', true, true);
    expect(res).to.equal(expected);
  });

});

