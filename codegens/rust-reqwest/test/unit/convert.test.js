const expect = require('chai').expect,
  sdk = require('postman-collection'),
  convert = require('../../lib/index').convert;

describe('Rust reqwest converter', function () {
  it('should throw an error when callback is not function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Rust~reqwest-convert: Callback is not a function');
  });

  it('should set no redirect policy when followRedirect is set to false', function () {
    const request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'http://postman-echo.com/get',
          'protocol': 'http',
          'host': [
            'google',
            'com'
          ]
        }
      }),
      options = {followRedirect: false};
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('redirect(reqwest::redirect::Policy::none())');
    });
  });

  it('should set read timeout when requestTimeout is set to non zero value', function () {
    const request = new sdk.Request({
        'method': 'GET',
        'header': [],
        'url': {
          'raw': 'http://postman-echo.com/get',
          'protocol': 'http',
          'host': [
            'google',
            'com'
          ]
        }
      }),
      options = {requestTimeout: 3000};
    convert(request, options, function (error, snippet) {
      if (error) {
        expect.fail(null, null, error);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.include('timeout(std::time::Duration::from_millis(3000))');
    });
  });

});
