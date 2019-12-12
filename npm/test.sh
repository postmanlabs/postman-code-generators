#!/bin/bash
set -e;

echo "Checking if languages.js file is present"

pushd ./lib/assets &>/dev/null
if [ -e languages.js ];
then
    echo "languages.js present"
else
    echo "Please run 'node npm/pre-package.js' to get the file languages.js"
    exit 1;
fi
popd &>/dev/null
echo "Running newman for common collection and storing results in newmanResponses.json"
    node ./test/codegen/newman/runNewman.js

if [ -n "$1" ]
then
    CODEGEN=$1;
    if [ ! -d "./codegens/$CODEGEN" ]; 
    then
        echo "Codegen $CODEGEN doesn't exist, please enter valid name";
        exit 1;
    fi
    echo "$1 : codegen-structure test";
    mocha ./test/codegen/structure.test.js $1;
    echo "$1 : codegen-sanity test";
    mocha ./test/codegen/sanity/sanity.test.js $1;
    echo "$1 : npm test";
    pushd ./codegens/$CODEGEN &>/dev/null;
    npm test;
    popd &>/dev/null;
else
    echo "Running common repository tests"
    # check whether all dependencies used are present in package.json, and vice versa.
    dependency-check ./package.json --no-dev --missing

    # check for .gitignore, license.md, readme.md, .eslintrc and package.json
    mocha ./test/system/repository.test.js;
    
    # Common structure and npm test for each codegen.
    echo -e "Running codegen-structure tests on all the codegens";
    for directory in codegens/*; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory:9} # directory contains codegens/js-jquery, we need to pass js-jquery
            echo "$codegen_name : codegen-structure test";
            mocha ./test/codegen/structure.test.js $codegen_name;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done

    # Sanity check for each codegen.
    echo -e "Running codegen-sanity tests on all the codegens";
    for directory in codegens/*; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory:9}
            echo "$codegen_name : codegen-structure test";
            mocha ./test/codegen/sanity/sanity.test.js $codegen_name;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done

    echo -e "Running npm test on all the codegens";
    for directory in codegens/*; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory:9} # directory contains codegens/js-jquery, we need to pass js-jquery
            echo "$codegen_name : npm test";
            pushd $directory &>/dev/null;
            npm test;
            popd &>/dev/null;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done

fi
