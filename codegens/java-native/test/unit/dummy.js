
var expect = require('chai').expect,
sdk = require('postman-collection'),
sanitize = require('../../lib/util').sanitize,
convert = require('../../lib/index').convert,
getOptions = require('../../lib/index').getOptions,
mainCollection = require('../../../../test/codegen/newman/fixtures/basicCollection.json');

 

var request = new sdk.Request({
    "method": "POST",
						"header": [],
						"body": {
							"mode": "file",
							"file": {
								"src": "dummy.png"
							}
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
  convert(request, {}, function (error, snippet) {
   console.log("snippet executed");
   console.log(snippet);

});