#!/bin/bash
set -e;
if [ -n "$1" ]
then
    CODEGEN="codegen-"$1;
    if [ ! -d "./codegens/$CODEGEN" ]; 
    then
        echo "Codegen $CODEGEN doesn't exist, please enter valid name";
        exit 1;
    fi
    echo "$1 : codegen-structure test";
    mocha ./test/codegen/structure.test.js $1;
    echo "$1 : npm test";
    pushd ./codegens/$CODEGEN &>/dev/null;
    npm test;
    popd &>/dev/null;
else
    echo "Running common repository tests"
    # check whether all dependencies used are present in package.json, and vice versa.
    dependency-check ./package.json --extra --no-dev --missing

    # check for .gitignore, license.md, readme.md, .eslintrc and package.json
    mocha ./test/system/repository.test.js;
    
    # Common structure and npm test for each codegen.
    echo -e "Running tests on all the codegens";
    for directory in codegens/*; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory:17}
            echo "$codegen_name : codegen-structure test";
            mocha ./test/codegen/structure.test.js $codegen_name;
            echo "$codegen_name : npm test";
            pushd $directory &>/dev/null;
            npm test;
            popd &>/dev/null;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done
    popd &>/dev/null;
fi