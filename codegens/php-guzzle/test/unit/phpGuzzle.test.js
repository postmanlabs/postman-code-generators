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
    getSnippetRequestObject,
    groupHeadersSameKey,
    getSnippetBoilerplate,
    getIncludeBoilerplate
  } = require('../../lib/phpGuzzle'),
  collectionsPath = './fixtures';

describe('convert function', function () {

  it('should convert a simple get request', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString())));
    convert(collection.items.members[0].request, {includeBoilerplate: true}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
    });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Guzzle~convert: Callback is not a function');
  });

  it('should convert a simple get request without boilerplate', function (done) {
    const collection = new sdk.Collection(JSON.parse(
      fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString())));
    convert(collection.items.members[0].request, {includeBoilerplate: false}, function (err, snippet) {
      if (err) {
        console.error(err);
      }
      expect(snippet).to.not.be.empty;
      expect(snippet).to.not.include('use');
    });
    done();
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
      expectedString = '$headers = [\n' +
      '  \'my-sample-header\' => \'Lorem ipsum dolor sit amet \',' +
      '\n  \'testing\' => \'\\\'singlequotes\\\'\',' +
      '\n  \'TEST\' => \'"doublequotes"\'' +
      '\n];\n';
    expect(getSnippetHeaders(headersArray, '  ')).to.equal(expectedString);
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
    const expectedString = '$res = $client->sendAsync($request)->wait();\necho $res->getBody();\n';
    expect(getSnippetFooter()).to.equal(expectedString);
  });

  it('should return the async version with request options', function () {
    const expectedString = '$res = $client->sendAsync($request, $options)->wait();\necho $res->getBody();\n';
    expect(getSnippetFooter({}, true)).to.equal(expectedString);
  });

  it('should return the async version with empty options', function () {
    const expectedString = '$res = $client->sendAsync($request)->wait();\necho $res->getBody();\n';
    expect(getSnippetFooter({})).to.equal(expectedString);
  });

  it('should return the async version with options as async', function () {
    const expectedString = '$res = $client->sendAsync($request)->wait();\necho $res->getBody();\n';
    expect(getSnippetFooter({asyncType: 'async'})).to.equal(expectedString);
  });

  it('should return the async version with options as other string', function () {
    const expectedString = '$res = $client->sendAsync($request)->wait();\necho $res->getBody();\n';
    expect(getSnippetFooter({asyncType: 'other'})).to.equal(expectedString);
  });

  it('should return the sync version with options as sync', function () {
    const expectedString = '$res = $client->send($request);\n' +
    'echo $res->getBody();\n';
    expect(getSnippetFooter({asyncType: 'sync'})).to.equal(expectedString);
  });

  it('should return the options when are present', function () {
    const expectedString = '$res = $client->send($request, $options);\n' +
    'echo $res->getBody();\n';
    expect(getSnippetFooter({asyncType: 'sync'}, true)).to.equal(expectedString);
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

describe('groupHeadersSameKey method', function () {
  it('should group two headers with same key', function () {
    const result = groupHeadersSameKey([{ key: 'key1', value: 'value1'}, { key: 'key1', value: 'value2'}]);
    expect(result.length).to.equal(1);
    expect(result[0].value).to.equal('value1, value2');
    expect(result[0].key).to.equal('key1');
  });
});

describe('getSnippetBoilerplate method', function () {
  it('should the boilerplate with include option in true"', function () {
    const expected = '<?php\n' +
    '$composerHome = substr(shell_exec(\'composer config home -g\'), 0, -1).\'/vendor/autoload.php\';\n' +
    'require $composerHome; // your path to autoload.php \n' +
    'use Psr\\Http\\Message\\ResponseInterface;\n' +
    'use GuzzleHttp\\Exception\\RequestException;\n' +
    'use GuzzleHttp\\Client;\n' +
    'use GuzzleHttp\\Psr7\\Utils;\n' +
    'use GuzzleHttp\\Psr7\\Request;\n',
      result = getSnippetBoilerplate(true);
    expect(result).to.equal(expected);
  });

  it('should return empty string for include option in false', function () {
    const expected = '<?php\n',
      result = getSnippetBoilerplate(false);
    expect(result).to.equal(expected);
  });
});

describe('getIncludeBoilerplate method', function () {
  it('should return false with empty options', function () {
    const result = getIncludeBoilerplate({});
    expect(result).to.be.false;
  });
  it('should return false with undefined options', function () {
    const result = getIncludeBoilerplate();
    expect(result).to.be.false;
  });
  it('should return false with null options', function () {
    const result = getIncludeBoilerplate(null);
    expect(result).to.be.false;
  });
  it('should return false with options and include option not present', function () {
    const result = getIncludeBoilerplate({asyncType: 'sync'});
    expect(result).to.be.false;
  });
  it('should return false with options and include option present with value of false', function () {
    const result = getIncludeBoilerplate({includeBoilerplate: false});
    expect(result).to.be.false;
  });
  it('should return false with options and include option present with value of false', function () {
    const result = getIncludeBoilerplate({includeBoilerplate: true});
    expect(result).to.be.true;
  });
  it('should return false with options and include option present with value of false', function () {
    const result = getIncludeBoilerplate({includeBoilerplate: undefined});
    expect(result).to.be.false;
  });
  it('should return false with options and include option present with value of false', function () {
    const result = getIncludeBoilerplate({includeBoilerplate: null});
    expect(result).to.be.false;
  });
});
