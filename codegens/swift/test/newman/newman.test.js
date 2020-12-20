var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe.skip('Convert for different types of request', function () {
  var options = {
      indentType: 'Space',
      indentCount: 4
    },
    // if running locally on mac change the runScript to 'swift snippet.swift'
    testConfig = {
      fileName: 'snippet.swift',
      runScript: 'swift-5.3-RELEASE-ubuntu16.04/usr/bin/swift snippet.swift',
      skipCollections: ['sameNameHeadersCollection']
    };
  runNewmanTest(convert, options, testConfig);
});
