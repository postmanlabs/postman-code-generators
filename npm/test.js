var shell = require('shelljs'),
  path = require('path'),
  async = require('async'),
  fs = require('fs'),
  exists,
  codegen,
  codegen_path,
  getSubfolders,
  individual_test,
  commandOut,
  pwd = shell.pwd();

const args = process.argv[2],
  PATH_TO_CODEGENS_FOLDER = path.resolve(__dirname, '../codegens');

// throw JS error when any shell.js command encounters an error
shell.config.fatal=true;

console.log('Checking if languages.js file is present');
shell.cd('./lib/assets');
exists = fs.existsSync('languages.js');
if (exists) {
    console.log('languages.js present');
}
else {
    console.log('Please run \'node npm/pre-package.js\' to get the file languages.js');
    shell.exit(1);
}
shell.cd(pwd);

// Creating sample test files for testing formdataFileCollection
console.log('Creating test files and adding paths to collection for testing form data file uploads');
exists=fs.existsSync('test1.txt');
if( !exists ) {
    shell.exec('echo "Sample file 1" >> test1.txt');
}
exists=fs.existsSync('test2.txt');
if( !exists ) {
    shell.exec('echo "Sample file 2" >> test2.txt');
}
exists=fs.existsSync('test3.txt');
if( !exists ) {
    shell.exec('echo "Sample file 3" >> test3.txt');
}

commandOut = shell.exec('node ./npm/addPathToFormdataFile.js', {silent: true});
if(commandOut.code !==0) {
    console.log('Failed to set path for formdataFile, here\'s the error');
    console.log(commandOut.stderr);
    shell.exit(1);
}

console.log('Running newman for common collection and storing results in newmanResponses.json');
commandOut = shell.exec('node ./test/codegen/newman/runNewman.js --color always');
if(commandOut.code !==0) {
    console.log('Failed to run newman test, here\'s the error');
    console.log(commandOut.stderr);
    shell.exit(1);
}
else {
    console.log(commandOut.stdout);
}

getSubfolders = (folder) => {
    return fs.readdirSync(folder)
      .map((subfolder) => { return { path: path.join(folder, subfolder), name: subfolder}; })
      .filter((obj) => { return fs.statSync(obj.path).isDirectory(); });
};

individual_test = (codegen) => {
        async.series([
            function (next) {
                console.log(`${codegen} : codegen-structure test`);
                commandOut = shell.exec(`mocha ./test/codegen/structure.test.js ${codegen} --color always`, {silent: true}); 
                    if(commandOut.code !==0) {
                        console.error(`Failed to run codegen structure test on codegen ${codegen}, here\'s the error:`);
                        return next(commandOut.stderr);
                    }
                    console.log(commandOut.stdout);
                    return next();
            },
            function (next) {
                console.log(`${codegen} : codegen-sanity test`);
                commandOut = shell.exec(`mocha ./test/codegen/sanity/sanity.test.js ${codegen} --color always`, {silent: true}); 
                    if(commandOut.code !==0) {
                        console.error(`Failed to run codegen sanity test on codegen ${codegen}, here\'s the error:`);
                        return next(commandOut.stderr);
                    }
                    console.log(commandOut.stdout);
                    return next();
            },
            function (next) {
                codegen_path = path.join(PATH_TO_CODEGENS_FOLDER, codegen);
                shell.cd(codegen_path);
                commandOut = shell.exec('npm test --color always'); 
                    if(commandOut.code !==0) {
                        console.error(`Failed to run codegen test on codegen ${codegen}, here\'s the error:`);
                        return next(commandOut.stderr);
                    }
                    console.log(commandOut.stdout);
            }], (err) =>{
                console.error(err);
                shell.exit(1);
            });
    }

if(args) {
    codegen=args;
    codegen_path = path.join(PATH_TO_CODEGENS_FOLDER, codegen);
    try {
        exists=fs.statSync(codegen_path).isDirectory();
    } catch (err) {
        console.log(`Codegen ${codegen} doesn't exist, please enter a valid name`);
        console.log(err);
        shell.exit(1);
    }
    individual_test(codegen);
    shell.cd(pwd);
}

else {
    console.log('Running common repository tests');
    async.series([
        function (next) {
            //check whether all dependencies used are present in package.json, and vice versa.
            commandOut = shell.exec('dependency-check ./package.json --no-dev --missing --color always', {silent: true});
                if(commandOut.code !==0) {
                    console.error(`Failed to run dependency check, here\'s the error:`);
                    return next(commandOut.stderr);
                }
                console.log(commandOut.stdout);
                return next();
        },
        function (next) {
            // check for .gitignore, license.md, readme.md, .eslintrc and package.json
            commandOut = shell.exec('mocha ./test/system/repository.test.js --color always', {silent: true});
                if(commandOut.code !==0) {
                    console.error(`Failed to run checks for .gitignore/ license.md/ readme.md/ .eslintrc/ package.json, here\'s the error:`);
                    return next(commandOut.stderr);
                }
                console.log(commandOut.stdout);
                return next();
        },
        function (next) {
            var codegens = getSubfolders(PATH_TO_CODEGENS_FOLDER);
            codegens.forEach((codegen)=>{
                individual_test(codegen.name);
            });
        }
    ], (err) =>{
        console.log(err);
        shell.exit(1);
    });
}

exists = fs.existsSync('test1.txt');
if(exists)  {
    fs.unlinkSync('test1.txt');
}
exists = fs.existsSync('test2.txt');
if(exists)  {
    fs.unlinkSync('test2.txt');
}
exists = fs.existsSync('test3.txt');
if(exists)  {
    fs.unlinkSync('test3.txt');
}
