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
    addContentTypeHeader,
    buildOptionsSnippet
  } = require('../../lib/rRcurl');

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
    // collection.items.members.forEach((item) => {
    convert(collection.items.members[32].request, { requestTimeout: 5000}, function (err, snippet) {
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
      ' .params = params, .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(httpheader = headers), style = "post")\n',
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

  it('should generate get url snippet with headers', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers", .opts=list(httpheader = headers))\n',
      res = getSnippetGetURL('https://postman-echo.com/headers', true);
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without headers', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers")\n',
      res = getSnippetGetURL('https://postman-echo.com/headers', false);
    expect(res).to.equal(expected);
  });

  it('should generate get url snippet with headers and timeout', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers",' +
      ' .opts=list(httpheader = headers, timeout.ms = 5000))\n',
      res = getSnippetGetURL('https://postman-echo.com/headers', true, 5000);
    expect(res).to.equal(expected);
  });

  it('should generate get url snippet without headers and with timeout', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers",' +
      ' .opts=list(timeout.ms = 5000))\n',
      res = getSnippetGetURL('https://postman-echo.com/headers', false, 5000);
    expect(res).to.equal(expected);
  });
});

describe('getSnippetRequest function', function () {

  it('should generate snippet method GET with headers', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers", .opts=list(httpheader = headers))\n',
      res = getSnippetRequest('https://postman-echo.com/headers', 'GET', '', false, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET with follow location in false', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers", .opts=list(followlocation = FALSE))\n',
      res = getSnippetRequest('https://postman-echo.com/headers', 'GET', '', false, false,
        undefined, undefined, 0, false);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET without headers', function () {
    const expected = 'res <- getURL("https://postman-echo.com/headers")\n',
      res = getSnippetRequest('https://postman-echo.com/headers', 'GET', '', false, false);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST for url encoded with headers and params', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = params, .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, true, 'application/x-www-form-urlencoded', {});
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST for form data encoded with headers and params', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = params, .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, true, 'multipart/form-data', {});
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST for form data encoded with params and not follow location', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .params = params, .opts=list(followlocation = FALSE), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, false, 'multipart/form-data', {}, 0, false);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST for raw data', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
    ' .opts=list(postfields = params, httpheader = headers), style = "post")\n',
      res = getSnippetRequest('https://postman-echo.com/post', 'POST', 'post',
        true, true, 'application/json', {});
    expect(res).to.equal(expected);
  });

});

describe('getSnippetPostFormInParams method', function () {

  it('should generate snippet method POST with params headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params headers and httppost style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader = headers), style = "httpost")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'httpost', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params headers, post style and timeout', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader = headers, timeout.ms = 5000), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true, 5000);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params without headers, post style and timeout', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(timeout.ms = 5000), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, false, 5000);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params no headers, post style timeout no follow location', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(timeout.ms = 5000, followlocation = FALSE), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, false, 5000, false);
    expect(res).to.equal(expected);
  });
});

describe('getSnippetPostFormInParams method', function () {
  it('should generate snippet method POST with params, headers and post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params, headers and httppost style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader = headers), style = "httpost")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'httpost', true, true);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST with params, headers post style and timeout', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .params = params, .opts=list(httpheader = headers, timeout.ms = 5000), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', true, true, 5000);
    expect(res).to.equal(expected);
  });

  it('should generate snippet method POST without params, with headers post style', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetPostFormInParams('https://postman-echo.com/post', 'post', false, true, 0);
    expect(res).to.equal(expected);
  });

});

describe('getSnippetPostFormInOptions method', function () {
  it('should return snippet with params and headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(postfields = params, httpheader = headers), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', true, true);
    expect(res).to.equal(expected);
  });
  it('should return snippet with params and without headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(postfields = params), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', true, false);
    expect(res).to.equal(expected);
  });
  it('should return snippet without params and with headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(httpheader = headers), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', false, true);
    expect(res).to.equal(expected);
  });
  it('should return snippet without params and without headers', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', false, false);
    expect(res).to.equal(expected);
  });
  it('should return snippet with params, headers and timeout', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(postfields = params, httpheader = headers, timeout.ms = 5000), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', true, true, 5000);
    expect(res).to.equal(expected);
  });
  it('should return snippet without params and with headers and timeout', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(httpheader = headers, timeout.ms = 5000), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', false, true, 5000);
    expect(res).to.equal(expected);
  });

  it('should return snippet without params, headers and with timeout', function () {
    const expected = 'res <- postForm("https://postman-echo.com/post",' +
      ' .opts=list(timeout.ms = 5000), style = "post")\n',
      res = getSnippetPostFormInOptions('https://postman-echo.com/post', 'post', false, false, 5000);
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

describe('buildOptionsSnippet method', function () {
  it('should return options for params headers and timeout', function () {
    const result = buildOptionsSnippet(true, true, 5000);
    expect(result).to.equal('postfields = params, httpheader = headers, timeout.ms = 5000');
  });

  it('should return options for params and headers', function () {
    const result = buildOptionsSnippet(true, true, 0);
    expect(result).to.equal('postfields = params, httpheader = headers');
  });

  it('should return options for params and timeout', function () {
    const result = buildOptionsSnippet(true, false, 5000);
    expect(result).to.equal('postfields = params, timeout.ms = 5000');
  });

  it('should return options for headers and timeout', function () {
    const result = buildOptionsSnippet(false, true, 5000);
    expect(result).to.equal('httpheader = headers, timeout.ms = 5000');
  });
  it('should return options for headers', function () {
    const result = buildOptionsSnippet(false, true, 0);
    expect(result).to.equal('httpheader = headers');
  });

  it('should return options for timeout', function () {
    const result = buildOptionsSnippet(false, false, 5000);
    expect(result).to.equal('timeout.ms = 5000');
  });

  it('should return empty string options for no options', function () {
    const result = buildOptionsSnippet(false, false, 0);
    expect(result).to.equal('');
  });

  it('should return options for params headers timeout and follow redirect on false', function () {
    const result = buildOptionsSnippet(true, true, 5000, false);
    expect(result).to.equal('postfields = params, httpheader = headers, timeout.ms = 5000, followlocation = FALSE');
  });

  it('should return options for headers timeout and follow redirect on false', function () {
    const result = buildOptionsSnippet(false, true, 5000, false);
    expect(result).to.equal('httpheader = headers, timeout.ms = 5000, followlocation = FALSE');
  });

});
