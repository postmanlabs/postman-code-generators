var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../lib/index').convert;

describe('Convert for different types of request', function () {
  const options = {
      includeBoilerplate: true,
      indentType: 'Space',
      indentCount: 4,
      asyncAwaitEnabled: false
    },
    // if running locally on mac change the runScript to 'swift snippet.swift'
    testConfig = {
      fileName: 'snippet.swift',
      runScript: 'swift-5.7.3-RELEASE-ubuntu20.04/usr/bin/swift snippet.swift',
      skipCollections: ['sameNameHeadersCollection', 'unsupportedMethods']
    };
  runNewmanTest(convert, options, testConfig);

  describe('Convert for request incorporating async/await features', function () {
    const options = {
        includeBoilerplate: true,
        indentType: 'Space',
        indentCount: 4,
        asyncAwaitEnabled: true
      },
      testConfig = {
        fileName: 'snippet.swift',
        runScript: 'swift-5.7.3-RELEASE-ubuntu20.04/usr/bin/swift snippet.swift',
        skipCollections: ['sameNameHeadersCollection', 'unsupportedMethods']
      };

    runNewmanTest(convert, options, testConfig);
  });
});
