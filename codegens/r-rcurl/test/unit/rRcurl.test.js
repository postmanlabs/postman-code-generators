var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),
  {
    convert,
    getSnippetHeaders,
    getSnippetPostFormInParams,
    getSnippetGetURL,
    getSnippetRequest,
    getSnippetPostFormInOptions,
    addContentTypeHeader
  } = require('../../lib/rRcurl');

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
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

describe('getSnippetPostFormInParams function', function () {

  it('should generate postForm snippet with params headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      '  .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', false, true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without headers with params and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = params, style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, false);
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

  it('should generate snippet method POST for url encoded with headers and params', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = params, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, true, 'application/x-www-form-urlencoded', {});
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST for form data encoded with headers and params', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = params, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, true, 'multipart/form-data', {});
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST for raw data', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .opts=list(httpheader=headers, postfields=params), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, true, 'application/json', {});
    expect(res).to.equal(expected);
  });

});

describe('getSnippetPostFormInParams method', function () {

  it('should generate snippet method POST with params headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params headers and httppost style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader=headers), style = "httpost")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'httpost', true, true);
    expect(res).to.equal(expected);
  });
});

describe('getSnippetPostFormInParams method', function () {
  it('should generate snippet method POST with params headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params headers and httppost style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader=headers), style = "httpost")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'httpost', true, true);
    expect(res).to.equal(expected);
  });
});

describe('getSnippetPostFormInOptions method', function () {
  it('should return snippet with params and headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(httpheader=headers, postfields=params), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });
  it('should return snippet with params and without headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(postfields=params), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', true, false);
    expect(res).to.equal(expected);
  });
  it('should return snippet without params and with headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(httpheader=headers), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', false, true);
    expect(res).to.equal(expected);
  });
  it('should return snippet without params and without headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', false, false);
    expect(res).to.equal(expected);
  });
});

describe('addContentTypeHeader method', function () {
  it('should add content type header when is graphql', function () {
    const request = new sdk.Request({
      'method': 'POST',
      'header': [
      ],
      'url': {
        'raw': 'https://google.com',
        'protocol': 'https',
        'host': [
          'google',
          'com'
        ]
      },
      'body': {
        mode: 'graphql'
      }
    });
    addContentTypeHeader(request);
    expect(request.headers.members[0].value).to.equal('application/json');
  });

  it('should not add content type header when is not graphql', function () {
    const request = new sdk.Request({
      'method': 'POST',
      'header': [
      ],
      'url': {
        'raw': 'https://google.com',
        'protocol': 'https',
        'host': [
          'google',
          'com'
        ]
      },
      'body': {
        mode: 'raw'
      }
    });
    addContentTypeHeader(request);
    expect(request.headers.members).to.be.empty;
  });
});
