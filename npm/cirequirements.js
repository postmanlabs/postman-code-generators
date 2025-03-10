const path = require('path'),
  fs = require('fs'),
  shell = require('shelljs');

const getSubfolders = (folder) => {
    return fs.readdirSync(folder)
      .map((subfolder) => { return { path: path.join(folder, subfolder), name: subfolder}; })
      .filter((obj) => { return fs.statSync(obj.path).isDirectory(); });
  },

  args = process.argv,
  PATH_TO_CODEGENS_FOLDER = path.resolve(__dirname, '../codegens');

getSubfolders(PATH_TO_CODEGENS_FOLDER)
  .filter((codegen) => {
    // check if specific codegen is requested
    const requestedCodegen = args.length > 2 ? args[2] : null;
    if (requestedCodegen === null) {
      return true;
    }
    return codegen.name === requestedCodegen;
  })
  .filter((codegen) => {
    // check if requested codegen has a installation script
    return fs.existsSync(path.join(codegen.path, 'test', 'ci-install.sh'));
  }).forEach((codegen) => {
    console.log('Installing CI dependencies for codegen: ' + codegen.name);
    const commandOut = shell.exec(path.join(codegen.path, 'test', 'ci-install.sh'));

    if (commandOut.code !== 0) {
      console.error('Failed to install CI dependencies for codegen: ' + codegen.name);
      console.error(commandOut.stderr);
      process.exit(1);
    }

    console.log(commandOut.stdout);
  });

