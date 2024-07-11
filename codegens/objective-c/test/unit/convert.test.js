var convert = require('../../index').convert,
  expect = require('chai').expect,
  collection = require('./fixtures/collection.json'),
  sdk = require('postman-collection'),
  expectedSnippets = require('./fixtures/snippets.json');

describe('Objective-C-NSURLSession Converter', function () {
  describe('convert for different request types', function () {
    collection.item.forEach((item) => {
      it(item.name, function (done) {
        const request = new sdk.Request(item.request);
        convert(request, {}, (err, snippet) => {
          if (err) {
            expect.fail(null, null, err);
            return done();
          }
          expect(snippet).to.equal(expectedSnippets[item.name]);
          return done();
        });
      });
    });
  });
});

describe('Options Tests', function () {
  it('should indent snippet with type and count specified', function () {
    var request = new sdk.Request(collection.item[0].request);
    convert(request, {
      indentType: 'Tab',
      indentCount: 2
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      var snippetArray = snippet.split('\n'),
        i;
      for (i = 0; i < snippetArray.length; i++) {
        if (snippetArray[i].startsWith('cachePolicy:NSURLRequestUseProtocolCachePolicy')) {
          expect(snippetArray[i + 1].charAt(0)).to.equal('\t');
          expect(snippetArray[i + 1].charAt(1)).to.equal('\t');
          expect(snippetArray[i + 1].charAt(2)).to.not.equal(' ');
        }
      }
    });
  });

  it('should use all the default options', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'raw',
        'raw': '  trim this body  '
      },
      'url': {
        'raw': 'https://postman-echo.com/post',
        'protocol': 'https',
        'host': [
          'postman-echo',
          'com'
        ],
        'path': [
          'post'
        ]
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      var snippetArray = snippet.split('\n'),
        i;
      for (i = 0; i < snippetArray.length; i++) {
        if (snippetArray[i].startsWith('cachePolicy:NSURLRequestUseProtocolCachePolicy')) {
          expect(snippetArray[i + 1].charAt(0)).to.equal(' ');
          expect(snippetArray[i + 1].charAt(1)).to.equal(' ');
          expect(snippet).to.include('timeoutInterval:10');
          expect(snippet).to.include('  trim this body  ');
        }
      }
    });
  });

  it('should add code for requestTimeout option', function () {
    var request = new sdk.Request(collection.item[0].request);
    convert(request, {
      requestTimeout: 5000
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('timeoutInterval:5');
    });
  });

  it('should trim request body when trimRequestBody is set to true', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'raw',
        'raw': '  trim this body  '
      },
      'url': {
        'raw': 'https://postman-echo.com/post',
        'protocol': 'https',
        'host': [
          'postman-echo',
          'com'
        ],
        'path': [
          'post'
        ]
      }
    });
    convert(request, {
      trimRequestBody: true
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.not.include('  trim this body  ');
      expect(snippet).to.include('trim this body');
    });
  });

  it('should include boiler plate if includeBoilerplate is set to true', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'raw',
        'raw': '  trim this body  '
      },
      'url': {
        'raw': 'https://postman-echo.com/post',
        'protocol': 'https',
        'host': [
          'postman-echo',
          'com'
        ],
        'path': [
          'post'
        ]
      }
    });
    convert(request, {
      includeBoilerplate: true
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('int main(int argc, const char * argv[])');
    });
  });
});
