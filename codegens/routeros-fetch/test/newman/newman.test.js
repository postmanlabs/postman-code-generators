var runNewmanTest = require('../../../../test/codegen/newman/newmanTestUtil').runNewmanTest,
  convert = require('../../index').convert;

describe('RouterOS Fetch Converter', function () {
  describe('convert for different request types', function () {
    var options = {},
      // eslint-disable-next-line no-unused-vars
      testConfigSshParse = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: 'routeros-fetch-cmd.rsc',
        // Run script required to run the generated code snippet
        runScript: 'ssh admin@192.168.88.1 \':delay 2s; [[:parse [/file/get newman.rsc contents]]]\'',
        // Compile script required to compile the code snippet
        compileScript: 'scp ./routeros-fetch-cmd.rsc admin@192.168.88.1:/newman.rsc; sleep 3',
        // Array of name of collections for which newman tests has to be skipped.
        skipCollections: ['unsupportedMethods', 'redirectCollection', 'queryParamsCollection']
      },
      testConfig = {
        // filename along with the appropriate version of the file. This file will be used to run the snippet.
        fileName: '',
        // Run script required to run the generated code snippet
        runScript: '',
        // Compile script required to compile the code snippet
        compileScript: '',
        // Array of name of collections for which newman tests has to be skipped.
        skipCollections: ['unsupportedMethods', 'redirectCollection', 'queryParamsCollection']
      };
    runNewmanTest(convert, options, testConfig);
  });
});
