describe('Convert for different types of request', function () {
  var options = {indentCount: 2, indentType: 'Space'},
    testConfig = {
      compileScript: null,
      runScript: 'node run.js',
      fileName: 'run.js',
      headerSnippet: '/* eslint-disable */\n'
    };

  runNewmanTest(convert, options, testConfig);
});
