var expect = require('chai').expect,
  sdk = require('postman-collection'),
  mainCollection = require('./fixtures/sample_collection.json'),
  runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Python- Requests converter', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4
    },
    testConfig = {
      fileName: 'test/unit/fixtures/codesnippet.py',
      runScript: 'python test/unit/fixtures/codesnippet.py',
      compileScript: null,
      skipCollections: ['formdataCollection.json']
    };
  runNewmanTest(convert, options, testConfig);

  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Python-Requests~convert: Callback is not a function');
  });

  it('should not have allow_redirects=False twice in generated snippet when' +
  ' followRedirect option is set as false', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      options = { followRedirect: false, requestTimeout: 0 };
    convert(request, options, function (err, snippet) {
      if (err) {
        expect.fail(null, null, err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.not.include('allow_redirects = False, allow_redirects = false');
    });
  });

  it('should have correct boolean value for allow_redirects(False, uppercased F) in generated snippet when' +
  ' followRedirect option is set as false', function () {
    var request = new sdk.Request(mainCollection.item[0].request),
      options = { followRedirect: false };
    convert(request, options, function (err, snippet) {
      if (err) {
        expect.fail(null, null, err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('allow_redirects = False');
      expect(snippet).to.not.include('allow_redirects = false');
    });
  });

  it('should trim header keys and not trim header values', function () {
    var request = new sdk.Request({
      'method': 'GET',
      'header': [
        {
          'key': '   key_containing_whitespaces  ',
          'value': '  value_containing_whitespaces  '
        }
      ],
      'url': {
        'raw': 'https://google.com',
        'protocol': 'https',
        'host': [
          'google',
          'com'
        ]
      }
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('\'key_containing_whitespaces\': \'  value_containing_whitespaces  \'');
    });
  });

});
