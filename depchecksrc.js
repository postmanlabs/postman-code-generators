const depcheck = require('depcheck');
const chalk = require('chalk');
const options = {
    ignoreBinPackage: false,
    ignoreDirs: [], // folder with these names will be ignored,
    ignoreMatches: [ // ignore dependencies that matches these globs
      'grunt-*'
    ],
    parsers: { // the target parsers
      '*.js': depcheck.parser.es6,
      '*.jsx': depcheck.parser.jsx
    },
    detectors: [ // the target detectors
      depcheck.detector.requireCallExpression,
      depcheck.detector.importDeclaration
    ],
    specials: [ // the target special parsers
      depcheck.special.eslint,
      depcheck.special.webpack
    ],
  };
  
  depcheck(__dirname, options, (unused) => {
    console.log(chalk.bgRed('UNUSED_DEPENDENCIES'), unused.dependencies);
    console.log(chalk.bgRed('\n\nUNUSED_DEV_DEPENDENCIES'), unused.devDependencies);
    console.log(chalk.bgRed('\n\nUSED_BY'), unused.using);
    console.log(chalk.bgRed('\n\nINVALID_FILES'), unused.invalidFiles);
    console.log(chalk.bgRed('\n\nINVALID_DIRS'), unused.invalidDirs);
  });