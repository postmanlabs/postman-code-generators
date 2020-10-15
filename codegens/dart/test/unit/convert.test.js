var convert = require('../../index').convert,
  expect = require('chai').expect,
  sdk = require('postman-collection');

// Disable check with expected snippets as we now have proper newman tests
describe('Dart Converter', function () {
  it('should add timeout if requestTimeout options is used', function () {
    var request = new sdk.Request({
      "method": "POST",
      "header": [
        {
          "key": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mode": "raw",
        "raw": "{\n  \"json\": \"Test-Test\"\n}"
      },
      "url": {
        "raw": "https://postman-echo.com/post",
        "protocol": "https",
        "host": [
          "postman-echo",
          "com"
        ],
        "path": [
          "post"
        ]
      },
    });

    convert(request, {requestTimeout: 5000}, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('.timeout(Duration(milliseconds: 5000))');
    });
  });

  it('should use http.MultipartRequest for formdata requests', function () {
    var request = new sdk.Request({
      "method": "POST",
      "header": [],
      "body": {
        "mode": "formdata",
        "formdata": []
      },
      "url": {
        "raw": "https://postman-echo.com/post",
        "protocol": "https",
        "host": [
          "postman-echo",
          "com"
        ],
        "path": [
          "post"
        ]
      }
    });
    convert(request, {}, function (err, snippet) {
      if (err) {
        expect.fail(err);
      }
      expect(snippet).to.be.a('string');
      expect(snippet).to.contain('http.MultipartRequest');
    })
  });
});
