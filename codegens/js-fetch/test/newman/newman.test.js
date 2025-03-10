var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert,
  NODE_VERSION = process.versions.node.split('.')[0];

describe('Convert for different types of request', function () {
  var testConfig = {
      compileScript: null,
      runScript: 'node snippet.js',
      fileName: 'snippet.js',
      skipCollections: ['formdataFileCollection']
    },
    options = {
      multiLine: true
    },
    testSnippet;

  if (NODE_VERSION < 21) {
    testSnippet = 'var fetch = require(\'node-fetch2\');\n';
  }
  else {
    testSnippet = 'var fetch = (...args) => import(\'node-fetch\').then(({default: fetch}) => fetch(...args));';
  }

  if (NODE_VERSION < 21) {
    // Newer node versions ship with built-in FormData, Headers and URLSearchParams class
    testSnippet += '\nvar FormData = require(\'formdata-node\').FormData,\n';
    testSnippet += 'Headers = require(\'node-fetch2\').Headers,\n';
    testSnippet += 'URLSearchParams = require(\'url\').URLSearchParams;\n\n';
  }

  testConfig.headerSnippet = testSnippet;
  runNewmanTest(convert, options, testConfig);
});
