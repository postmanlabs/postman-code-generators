var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),

  { getHeaders,
    getSnippetHeaders,
    getURL,
    getMethod,
    getIndentation,
    getSnippetClient,
    convert,
    getSnippetFooter,
    getSnippetRequestObject
  } = require('../../lib/phpGuzzle'),
  collectionsPath = './fixtures';

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString())));
    convert(collection.items.members[0].request, {}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      fs.writeFileSync(path.resolve(__dirname, collectionsPath, './snippet.php'), snippet);
    });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Guzzle~convert: Callback is not a function');
  });
});

describe('getHeaders function', function () {
  it('should return an array of headers', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      headers = getHeaders(collection.items.members[0].request);
    expect(headers.length).to.equal(3);
  });

  it('should return an empty array of headers', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      headers = getHeaders(collection.items.members[3].request);
    expect(headers.length).to.equal(0);
  });
});

describe('getSnippetHeaders function', function () {
  it('should return an string representing the headers', function () {
    const headersArray =
    [
      {
        key: 'my-sample-header',
        value: 'Lorem ipsum dolor sit amet'
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
      expectedString = '$headers = [\n' +
      '  \'my-sample-header\' => \'Lorem ipsum dolor sit amet\',' +
      '\n  \'testing\' => \'\\\'singlequotes\\\'\',' +
      '\n  \'TEST\' => \'"doublequotes"\'' +
      '\n];\n';
    expect(getSnippetHeaders(headersArray, '  ')).to.equal(expectedString);
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
      expectedString = '$headers = [\n' +
      '  \'my-sample-header\' => \'Lorem ipsum dolor sit amet\',' +
      '\n  \'TEST\' => \'@#$%^&*()\',' +
      '\n  \'more\' => \',./\\\';[]}{\\\\":?><|\'' +
      '\n];\n';
    expect(getSnippetHeaders(headersArray, '  ')).to.equal(expectedString);
  });

  it('should return an empty string when headers is an empty array', function () {
    expect(getSnippetHeaders([], '  ')).to.equal('');
  });
});

describe('getURL function', function () {
  it('should return an simple string from url object', function () {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString())));
    expect(getURL(collection.items.members[0].request)).to.equal('https://postman-echo.com/headers');
  });
});

describe('getMethod function', function () {
  it('should return an simple string representing the method from collection', function () {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString())));
    expect(getMethod(collection.items.members[0].request)).to.equal('GET');
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

describe('getSnippetClient function', function () {
  it('should return the client snippet without timeout and redirects', function () {
    const expectedString = '$client = new Client();\n';
    expect(getSnippetClient()).to.equal(expectedString);
  });

  it('should return the client snippet with timeout and no redirects option', function () {
    const expectedString = '$client = new Client([\n' +
  '  \'timeout\' => 2\n' +
  ']\n);\n';
    expect(getSnippetClient({requestTimeout: 2.0})).to.equal(expectedString);
  });

  it('should return the client snippet with timeout and allow redirects as false', function () {
    const expectedString = '$client = new Client([\n' +
  '  \'timeout\' => 2,\n' +
  '  \'allow_redirects\' => false\n' +
  ']\n);\n';
    expect(getSnippetClient({requestTimeout: 2.0, followRedirect: false})).to.equal(expectedString);
  });

  it('should return the client snippet with allow redirects as false', function () {
    const expectedString = '$client = new Client([\n' +
  '  \'allow_redirects\' => false\n' +
  ']\n);\n';
    expect(getSnippetClient({followRedirect: false})).to.equal(expectedString);
  });

});

describe('getSnippetFooter function', function () {
  it('should return the async version without options', function () {
    const expectedString = '$promise = $client->sendAsync($request);\n$promise->then' +
    '(\n  function (ResponseInterface $res) {\n    echo $res->getBody();\n  },\n ' +
    ' function (RequestException $e) {\n    echo $e->getMessage();\n    echo $e->getRequest()->getMethod();\n  }\n);\n';
    expect(getSnippetFooter()).to.equal(expectedString);
  });

  it('should return the async version with empty options', function () {
    const expectedString = '$promise = $client->sendAsync($request);\n$promise->then' +
    '(\n  function (ResponseInterface $res) {\n    echo $res->getBody();\n  },\n ' +
    ' function (RequestException $e) {\n    echo $e->getMessage();\n    echo $e->getRequest()->getMethod();\n  }\n);\n';
    expect(getSnippetFooter({})).to.equal(expectedString);
  });

  it('should return the async version with options as async', function () {
    const expectedString = '$promise = $client->sendAsync($request);\n$promise->then' +
    '(\n  function (ResponseInterface $res) {\n    echo $res->getBody();\n  },\n ' +
    ' function (RequestException $e) {\n    echo $e->getMessage();\n    echo $e->getRequest()->getMethod();\n  }\n);\n';
    expect(getSnippetFooter({asyncType: 'async'})).to.equal(expectedString);
  });

  it('should return the async version with options as other string', function () {
    const expectedString = '$promise = $client->sendAsync($request);\n$promise->then' +
    '(\n  function (ResponseInterface $res) {\n    echo $res->getBody();\n  },\n ' +
    ' function (RequestException $e) {\n    echo $e->getMessage();\n    echo $e->getRequest()->getMethod();\n  }\n);\n';
    expect(getSnippetFooter({asyncType: 'other'})).to.equal(expectedString);
  });

  it('should return the async version with options as sync', function () {
    const expectedString = '$res = $client->send($request);\n' +
    'echo $res->getBody();\n';
    expect(getSnippetFooter({asyncType: 'sync'})).to.equal(expectedString);
  });

});

describe('getSnippetRequestObject method', function () {
  it('should return snippet with body and headers', function () {
    const result = getSnippetRequestObject('POST', 'URL', true, 'some');
    expect(result).to.include('$body');
    expect(result).to.include('$headers');
  });
  it('should return snippet with headers', function () {
    const result = getSnippetRequestObject('POST', 'URL', false, 'some');
    expect(result).to.not.include('$body');
    expect(result).to.include('$headers');
  });
  it('should return snippet with body', function () {
    const result = getSnippetRequestObject('POST', 'URL', true, '');
    expect(result).to.include('$body');
    expect(result).to.not.include('$headers');
  });

  it('should return snippet without body and headers', function () {
    const result = getSnippetRequestObject('POST', 'URL', false, '');
    expect(result).to.not.include('$body');
    expect(result).to.not.include('$headers');
  });
});

