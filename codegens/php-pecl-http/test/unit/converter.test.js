var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  convert = require('../../lib').convert,
  getOptions = require('../../lib').getOptions,
  sanitize = require('../../lib/util/sanitize').sanitize,
  parseBody = require('../../lib/util/parseBody');

describe('Request Snippet', function () {

  describe('should be same as the valid request snippet for Php-Pecl(HTTP) for ', function () {

    it('request headers', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[0].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/headers\');\n' +
                '$request->setRequestMethod(\'GET\');\n$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n    \'my-sample-header\' => \'Lorem ipsum dolor sit amet\',\n' +
                '    \'testing\' => \'\\\'singlequotes\\\'\',\n    \'TEST\' => \'"doublequotes"\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('request headers (with special characters) + (Request timeout check)', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[1].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 10,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;' +
                '\n$request->setRequestUrl(\'https://postman-echo.com/headers\');\n' +
                '$request->setRequestMethod(\'GET\');\n' +
                '$request->setOptions(array(\'connecttimeout\' => 10));\n' +
                '$request->setHeaders(array(\n' +
                '    \'my-sample-header\' => \'Lorem ipsum dolor sit amet\',\n' +
                '    \'TEST\' => \'@#$%^&*()\',\n    \'more\' => \',./\\\';[]}{":?><|\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('request headers (disabled headers)', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[2].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/headers\');\n' +
                '$request->setRequestMethod(\'GET\');\n$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n    \'my-sample-header\' => \'Lorem ipsum dolor sit amet\',\n' +
                '    \'not-disabled-header\' => \'ENABLED\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('GET request with disabled query', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[3].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/get?test=123&anotherone=232\');\n' +
                '$request->setRequestMethod(\'GET\');\n$request->setOptions(array());\n\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST form data with special characters + (Check trim true)', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[4].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: true,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->addForm(array(\n' +
                '    \'pl\' => \'\\\'a\\\'\',\n    \'qu\' => \'"b"\',\n    ' +
                '\'hdjkljh\' => \'c\',\n    \'sa\' => \'d\',\n' +
                '    \'Special\' => \'!@#$%&*()^_+=`~\',\n    ' +
                '\'more\' => \',./\\\';[]}{":?><|\\\\\\\\\'\n), array());\n' +
                '$request->setBody($body);\n$request->setOptions(array());\n\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('Resolve URL (quotes + special characters)', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[5].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl' +
                '(\'https://postman-echo.com/post?a=!@$^*()_-`%26&b=,./\\\';[]}{":/?><||\\\\\');\n' +
                '$request->setRequestMethod(\'POST\');\n$request->setOptions(array());\n\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST raw text', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[6].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->append(\'Duis posuere augue vel cursus pharetra.' +
                ' In luctus a ex nec pretium. Praesent neque quam, tincidunt nec leo eget, rutrum vehicula magna.' +
                '\nMaecenas consequat elementum elit, id semper sem tristique et. Integer pulvinar enim quis' +
                ' consectetur interdum volutpat.\');\n' +
                '$request->setBody($body);\n$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n    \'Content-Type\' => \'application/x-www-form-urlencoded\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST urlencoded data with disabled entries + (Check for trim option false)', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[7].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->append(new http\\QueryString(array(\n' +
                '    \'1\' => \'\\\'a\\\'\',\n    \'2\' => \'"b"\',\n    \'\\\'3\\\'\' => \'c\',\n' +
                '    \'"4"      \' => \'d      \',\n    \'Special\' => \'!@#$%&*()^_=`~\',\n' +
                '    \'more\' => \',./\\\';[]}{":?><|\\\\\\\\\')));' +
                '$request->setBody($body);\n$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n    \'Content-Type\' => \'application/x-www-form-urlencoded\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST raw data as JSON', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[8].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->append(\'{\n  "json": "Test-Test"\n}\');\n' +
                '$request->setBody($body);\n$request->setOptions(array());\n$request->setHeaders(array(\n' +
                '    \'Content-Type\' => \'application/json\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST raw data as javascript', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[9].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->append(\'var val = 6;\nconsole.log(val);\');\n' +
                '$request->setBody($body);\n$request->setOptions(array());\n$request->setHeaders(array(\n' +
                '    \'Content-Type\' => \'application/javascript\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST raw data as text/xml', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[10].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n' +
                '$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->append(\'<xml>\n\tTest Test\n</xml>\');\n' +
                '$request->setBody($body);\n$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n    \'Content-Type\' => \'text/xml\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST raw data as text/html', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[11].request,
        outputSnippet;

      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n$body->append(\'<html>\n  Test Test\n</html>\');\n' +
                '$request->setBody($body);\n$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n' +
                '    \'Content-Type\' => \'text/html\'\n));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST binary file in body', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[25].request,
        outputSnippet;
      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n' +
                '$body->addForm(array(), array(' +
                '        array(\'name\' => \'\', \'type\' => \'\', \'file\' => \'\', \'data\' => null)));\n' +
                '$request->setBody($body);\n' +
                '$request->setOptions(array());\n' +
                '$request->setHeaders(array(\n' +
                '    \'Content-Type\' => \'application/x-www-form-urlencoded\'\n' +
                '));\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });

    it('POST form data with file', function (finish) {
      var collection = new sdk.Collection(JSON.parse(
          fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
        request = collection.items.members[26].request,
        outputSnippet;
      convert(request, {indentType: 'Space',
        indentCount: 4,
        requestTimeout: 0,
        trimRequestBody: false,
        addCacheHeader: false,
        followRedirect: true}, function (error, snippet) {
        if (error) {
          console.error(error);
        }
        outputSnippet = '<?php\n$client = new http\\Client;\n' +
                '$request = new http\\Client\\Request;\n' +
                '$request->setRequestUrl(\'https://postman-echo.com/post\');\n' +
                '$request->setRequestMethod(\'POST\');\n' +
                '$body = new http\\Message\\Body;\n' +
                '$body->addForm(array(\n\n' +
                '), array(        array(' +
                '\'name\' => \'test-file\', \'type\' => \'file\', \'file\' => \'\', \'data\' => null)));\n' +
                '$request->setBody($body);\n' +
                '$request->setOptions(array());\n\n' +
                '$client->enqueue($request)->send();\n' +
                '$response = $client->getResponse();\n' +
                'echo $response->getBody();\n';
        expect((snippet)).to.equal(outputSnippet);
        finish();
      });
    });
  });

  it('should not throw an error if options is a function', function (done) {
    var collection = new sdk.Collection(JSON.parse(
        fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
      request = collection.items.members[0].request;
    convert(request, getOptions(), function (error, snippet) {
      if (error) {
        console.log(error);
      }
      else {
        expect(snippet).not.to.be.equal('');
      }
      done();
    });
  });

  it('should return valid snippet when options is not passed as argument', function (done) {
    var collection = new sdk.Collection(JSON.parse(
        fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
      request = collection.items.members[0].request;
    convert(request, function (error, snippet) {
      if (error) {
        console.log(error);
      }
      else {
        expect(snippet).not.to.be.equal('');
      }
      done();
    });
  });

  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Pecl(HTTP)~convert: Callback is not a function');
  });

  it('should not have script closing tag ?>', function () {
    var collection = new sdk.Collection(JSON.parse(
        fs.readFileSync('test/unit/fixtures/sample_collection.json').toString())),
      request = collection.items.members[0].request;
    convert(request, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet.endsWith('?>')).to.be.false;
    });
  });

  describe('parseBody function', function () {
    it('should return empty string if request body is an empty string', function (done) {
      var request = {
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'raw',
          'raw': {}
        },
        'url': {
          'raw': 'https://mockbin.org/request',
          'protocol': 'https',
          'host': [
            'mockbin',
            'org'
          ],
          'path': [
            'request'
          ]
        }
      };
      expect(parseBody(request, {indentType: 'Space', indentCount: 4}, true)).to.be.equal('');
      done();
    });

    it('should return empty string if request body is present but body.mode is not present', function (done) {
      var request = {
        'method': 'POST',
        'header': [],
        'body': {},
        'url': {
          'raw': 'https://mockbin.org/request',
          'protocol': 'https',
          'host': [
            'mockbin',
            'org'
          ],
          'path': [
            'request'
          ]
        }
      };
      expect(parseBody(request, {indentType: 'Space', indentCount: 4}, true)).to.be.equal('');
      done();
    });

    it('parseBody should return empty body if request body mode is not valid', function (done) {
      var request = {
        'method': 'POST',
        'header': [],
        'body': {
          'mode': 'lorem'
        },
        'url': {
          'raw': 'https://mockbin.org/request',
          'protocol': 'https',
          'host': [
            'mockbin',
            'org'
          ],
          'path': [
            'request'
          ]
        }
      };
      expect(parseBody(request, {indentType: 'Space', indentCount: 4}, true)).to.be.equal('');
      done();
    });

    it('should return empty string if request body is not present', function (done) {
      var request = {
        'method': 'POST',
        'header': [],
        'url': {
          'raw': 'https://mockbin.org/request',
          'protocol': 'https',
          'host': [
            'mockbin',
            'org'
          ],
          'path': [
            'request'
          ]
        }
      };
      expect(parseBody(request, {indentType: 'Space', indentCount: 4}, true)).to.be.equal('');
      done();
    });
  });

  describe('getOptions function', function () {
    var options = getOptions();
    it('should return an array of specific options', function () {
      expect(options).to.be.an('array');
    });
    it('should have 2 as default indent count ', function () {
      expect(options[0].default).to.equal(2);
    });
    it('should have Space as default indent type ', function () {
      expect(options[1].default).to.equal('Space');
    });
    it('should have 0 as default request timeout ', function () {
      expect(options[2].default).to.equal(0);
    });
    it('should have default body trim set as false', function () {
      expect(options[3].default).to.equal(false);
    });
  });

  describe('Sanitize function', function () {
    it('should return empty string when input is not a string type', function () {
      expect(sanitize(123, false)).to.equal('');
      expect(sanitize(null, false)).to.equal('');
      expect(sanitize({}, false)).to.equal('');
      expect(sanitize([], false)).to.equal('');
    });
    it('should trim input string when needed', function () {
      expect(sanitize('inputString     ', true)).to.equal('inputString');
    });
  });
});
