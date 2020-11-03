var sdk = require('postman-collection'),
  codegen = require('./lib');

var request = new sdk.Request({
  'method': 'GET',
  'url': {
    'host': ['google', 'com'],
    'path': ['hello']
  }
});

codegen.convert('http', 'http', request, {}, (err, snippet) => {
  if (err) {
    console.log(err);
  }
  else {
    console.log(snippet);
  }
})
