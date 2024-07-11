var expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert,
  sanitize = require('../../lib/util/sanitize').sanitize,
  mainCollection = require('../unit/fixtures/sample_collection.json'),
  snippetFixture = require('../unit/fixtures/snippetFixtures.json');

/* global describe, it */
describe('PHP HTTP_Request2 converter', function () {

  it('should throw an error if callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('PHP-HttpRequest2-Converter: callback is not valid function');
  });

  mainCollection.item.forEach(function (item) {
    it(item.name, function (done) {
      var request = new sdk.Request(item.request);
      convert(request, {
        indentType: 'Space',
        indentCount: 2,
        trimRequestBody: false,
        followRedirect: true
      }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.equal((snippetFixture[item.name]));
      });
      done();
    });
  });

  it('should indent snippet with type and count specified', function () {
    var request = new sdk.Request(mainCollection.item[0].request);
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
        if (snippetArray[i].startsWith('$request->setHeader(array(')) {
          expect(snippetArray[i + 1].charAt(0)).to.equal('\t');
          expect(snippetArray[i + 1].charAt(1)).to.equal('\t');
          expect(snippetArray[i + 1].charAt(2)).to.not.equal(' ');
        }
      }
    });
  });

  it('should add code for followRedirect option when set and vice versa' +
    '(HTTP_Request2 doesn\'t follow redirect by default)', function () {
    var request = new sdk.Request(mainCollection.item[0].request);
    convert(request, {
      followRedirect: true
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('\'follow_redirects\' => TRUE');
    });

    convert(request, {
      followRedirect: false
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.not.include('\'follow_redirects\'');
    });
  });

  it('should add code for requestTimeout option', function () {
    var request = new sdk.Request(mainCollection.item[0].request);
    convert(request, {
      requestTimeout: 5000
    }, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('\'timeout\' => 5');
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

  it('should generate snippets for no files in form data', function () {
    var request = new sdk.Request({
      'method': 'POST',
      'header': [],
      'body': {
        'mode': 'formdata',
        'formdata': [
          {
            'key': 'no file',
            'value': '',
            'type': 'file',
            'src': []
          },
          {
            'key': 'no src',
            'value': '',
            'type': 'file'
          },
          {
            'key': 'invalid src',
            'value': '',
            'type': 'file',
            'src': {}
          }
        ]
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
      /* eslint-disable max-len*/
      /* eslint-disable quotes*/
      expect(snippet).to.include("$request->addUpload('no file', '/path/to/file', 'file', '<Content-Type Header>');");
      expect(snippet).to.include("$request->addUpload('no src', '/path/to/file', 'file', '<Content-Type Header>');");
      expect(snippet).to.include("$request->addUpload('invalid src', '/path/to/file', 'file', '<Content-Type Header>');");
      /* eslint-enable max-len*/
      /* eslint-enable quotes*/
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
