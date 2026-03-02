var expect = require('chai').expect,
  {
    getSnippetHeaders,
    getSnippetFromMethod,
    getSnippetRequest,
    getIndentation
  } = require('../../lib/rHttr');

describe('getSnippetHeaders function', function () {

  it('should generate headers declaration snippet', function () {
    const expected = 'headers = c(\n  \'"1"\' = \'\\\'a\\\'\',\n  \'"2"\' = \'"b"\'\n)\n\n',
      res = getSnippetHeaders([{ key: '"1"', value: '\'a\''}, { key: '"2"', value: '"b"'}], '  ');
    expect(res).to.equal(expected);
  });

  it('should generate empty headers declaration snippet without headers', function () {
    const expected = '',
      res = getSnippetHeaders([ ], '  ');
    expect(res).to.equal(expected);
  });

  it('should generate headers declaration snippet with empty indentation', function () {
    const expected = 'headers = c(\n\'"1"\' = \'\\\'a\\\'\',\n\'"2"\' = \'"b"\'\n)\n\n',
      res = getSnippetHeaders([{ key: '"1"', value: '\'a\''}, { key: '"2"', value: '"b"'}], '');
    expect(res).to.equal(expected);
  });

});

describe('getSnippetFromMethod function', function () {

  it('should generate postForm snippet with params headers and post style', function () {
    const expected = 'res <- VERB("POST", url = "https://postman-echo.com/post", ' +
      'body = body, add_headers(headers), encode = \'form\')\n\n',
      res = getSnippetFromMethod('https://postman-echo.com/post', true, true, 'POST', 'urlencoded');
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- VERB("POST", url = "https://postman-echo.com/post", ' +
      'add_headers(headers), encode = \'form\')\n\n',
      res = getSnippetFromMethod(
        'https://postman-echo.com/post',
        false,
        true,
        'POST',
        'urlencoded'
      );
    expect(res).to.equal(expected);
  });

  it('should generate postForm snippet without params with headers and post style', function () {
    const expected = 'res <- VERB("POST", url = "https://postman-echo.com/post", ' +
      'add_headers(headers), encode = \'form\', timeout(3))\n\n',
      res = getSnippetFromMethod(
        'https://postman-echo.com/post',
        false,
        true,
        'POST',
        'urlencoded',
        3
      );
    expect(res).to.equal(expected);
  });

  it('should generate GET snippet with params headers', function () {
    const expected = 'res <- VERB("GET", url = "https://postman-echo.com/headers", ' +
      'add_headers(headers))\n\n',
      res = getSnippetFromMethod('https://postman-echo.com/headers', false, true, 'GET', undefined, undefined);
    expect(res).to.equal(expected);
  });

  it('should generate GET snippet without headers', function () {
    const expected = 'res <- VERB("GET", url = "https://postman-echo.com/headers")\n\n',
      res = getSnippetFromMethod('https://postman-echo.com/headers', false, false, 'GET', undefined, undefined);
    expect(res).to.equal(expected);
  });

  it('should generate GET snippet with timeout', function () {
    const expected = 'res <- VERB("GET", url = "https://postman-echo.com/headers", timeout(3))\n\n',
      res = getSnippetFromMethod('https://postman-echo.com/headers', false, false, 'GET', undefined, 3);
    expect(res).to.equal(expected);
  });

});

describe('getSnippetRequest function', function () {

  it('should generate snippet method GET with headers', function () {
    const expected = 'res <- VERB("GET", url = "https://postman-echo.com/headers", add_headers(headers))\n\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'GET',
        hasParams: false,
        hasHeaders: true
      });
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET without headers', function () {
    const expected = 'res <- VERB("GET", url = "https://postman-echo.com/headers")\n\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'GET',
        hasParams: false,
        hasHeaders: false
      });
    expect(res).to.equal(expected);
  });

  it('should generate snippet method GET without headers and timeout', function () {
    const expected = 'res <- VERB("GET", url = "https://postman-echo.com/headers", timeout(3))\n\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'GET',
        hasParams: false,
        hasHeaders: false,
        requestTimeout: 3
      });
    expect(res).to.equal(expected);
  });

  it('should generate snippet method HEAD', function () {
    const expected = 'res <- VERB("HEAD", url = "https://postman-echo.com/headers")\n\n',
      res = getSnippetRequest({
        url: 'https://postman-echo.com/headers',
        method: 'HEAD',
        hasParams: false,
        hasHeaders: false
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
