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
    buildOptionsSnippet,
    groupHeadersSameKey,
    getIndentation,
    getSnippetPut,
    getSnippetDelete,
    getSnippetURLContent
  } = require('../../lib/rRcurl');

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));
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

  it('should return an string representing the headers special characters', function () {
    const headersArray =
    [
      {
        key: 'my-sample-header',
        value: 'Lorem ipsum dolor sit amet'
      },
      {
        key: 'TEST',
        value: '@#$%^&*()'
      },
      {
        key: 'more',
        value: ',./\';[]}{\\":?><|'
      }
    ],
      expectedString = 'headers = c(\n  "my-sample-header" = "Lorem ipsum dolor sit amet",\n' +
      '  "TEST" = "@#$%^&*()",\n  "more" = ",./\';[]}{\\\\\\":?><|"\n)\n';
    expect(getSnippetHeaders(headersArray, '  ')).to.equal(expectedString);
  });

  it('should return an string representing the headers trim only values', function () {
    const headersArray =
    [
      {
        key: 'my-sample-header ',
        value: 'Lorem ipsum dolor sit amet '
      },
      {
        key: 'testing',
        value: '\'singlequotes\''
      },
      {
        key: 'TEST',
        value: '"doublequotes"'
      }
    ],
      expectedString = 'headers = c(\n  "my-sample-header" = "Lorem ipsum dolor sit amet ",\n' +
      '  "testing" = "\'singlequotes\'",\n  "TEST" = "\\"doublequotes\\""\n)\n';
    expect(getSnippetHeaders(headersArray, '  ')).to.equal(expectedString);
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
    const expected = 'res <- getURL("https://postman-echo.com/headers")\n',
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
    ' .params = params, style = "post")\n',
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
      ' .params = params, .opts=list(timeout.ms = 5000), style = "post")\n',
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
    expect(result).to.equal('postfields = params, httpheader = headers, timeout.ms = 5000');
  });

  it('should return options for headers timeout and follow redirect on false', function () {
    const result = buildOptionsSnippet(false, true, 5000, false);
    expect(result).to.equal('httpheader = headers, timeout.ms = 5000');
  });

});

describe('groupHeadersSameKey method', function () {
  it('should group two headers with same key', function () {
    const result = groupHeadersSameKey([{ key: 'key1', value: 'value1'}, { key: 'key1', value: 'value2'}]);
    expect(result.length).to.equal(1);
    expect(result[0].value).to.equal('value1, value2');
    expect(result[0].key).to.equal('key1');
  });
});

describe('getIndentation function', function () {
  it('should return 3 whitespaces when indentType is whitespace and indentCount is 3', function () {
    expect(getIndentation({ indentType: ' ', indentCount: 3 })).to.equal('   ');
  });

  it('should return 3 spaces when indentType is the word Space and indentCount is 3', function () {
    expect(getIndentation({ indentType: 'Space', indentCount: 3 })).to.equal('   ');
  });

  it('should return 3 tabspaces when indentType is the word Space and indentCount is 3', function () {
    expect(getIndentation({ indentType: 'Space', indentCount: 3 })).to.equal('   ');
  });

  it('should return 1 tabspace when indentType is the word Tab and indentCount is 1', function () {
    expect(getIndentation({ indentType: 'Tab', indentCount: 1 })).to.equal('\t');
  });

  it('should return 2 whitespaces when there is no options object', function () {
    expect(getIndentation()).to.equal('  ');
  });

  it('should return 2 whitespaces when there is no indentation options in object', function () {
    expect(getIndentation({})).to.equal('  ');
  });
});

describe('getSnippetPut method', function () {
  it('should return put snippet with params headers and follow location false', function () {
    const result = getSnippetPut('url', true, true, 0, false);
    expect(result).to.equal('res <- httpPUT("url", params, httpheader = headers)\n');
  });
  it('should return put snippet without params headers and follow location false', function () {
    const result = getSnippetPut('url', false, true, 0, false);
    expect(result).to.equal('res <- httpPUT("url", httpheader = headers)\n');
  });
  it('should return put snippet with params and no options', function () {
    const result = getSnippetPut('url', true, false, 0, true);
    expect(result).to.equal('res <- httpPUT("url", params, followlocation = TRUE)\n');
  });
  it('should return put snippet without params and no options', function () {
    const result = getSnippetPut('url', false, false, 0, true);
    expect(result).to.equal('res <- httpPUT("url", followlocation = TRUE)\n');
  });
});

describe('getSnippetDelete method', function () {
  it('should return delete snippet with params headers and follow location false', function () {
    const result = getSnippetDelete('url', true, true, 0, false);
    expect(result).to.equal(
      'res <- httpDELETE("url", postfields = params, httpheader = headers)\n');
  });
  it('should return delete snippet withoutout params and options', function () {
    const result = getSnippetDelete('url', false, false, 0, true);
    expect(result).to.equal('res <- httpDELETE("url", followlocation = TRUE)\n');
  });
});

describe('getSnippetURLContent method', function () {
  it('should return url content snippet for PATCH with params headers and follow location false', function () {
    const result = getSnippetURLContent('url', true, true, 0, false, 'PATCH');
    expect(result).to.equal(
      'res <- getURLContent("url", customrequest = "PATCH", postfields = params, ' +
      'httpheader = headers)\n');
  });

  it('should return delete snippet for PATCH withoutout params and options', function () {
    const result = getSnippetURLContent('url', false, false, 0, true, 'PATCH');
    expect(result).to.equal('res <- getURLContent("url", customrequest = "PATCH", followlocation = TRUE)\n');
  });
});

