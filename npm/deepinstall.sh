#!/bin/bash
set -e; # stop on error

echo "Running pre-package script" 
node npm/pre-package.js
echo "Run successful languages.js saved in lib/assets"

if [ "$1" != "dev" ]
then
    echo "No dev flag detected, setting production flag for npm install"
    PROD_ENV="--production --no-audit";
else
    echo "Dev flag detected, both dependency and devDependency will be updated."
fi

if [ -n "$1" ] && [ "$1" != "dev" ];
then
    CODEGEN=$1 # Code gen where npm install is desired to run , first input argument
    if [ ! -d "./codegens/$CODEGEN" ]; 
    then
        echo "Codegen $CODEGEN doesn't exist, please enter valid name";
        exit 1;
    fi
    echo "$1 : npm install";
    pushd ./codegens/$CODEGEN &>/dev/null;
    npm install;
    npm shrinkwrap; # this is run inside each indiv. codegen during packaging
    popd &>/dev/null;
    exit 0;
else
    echo "Running npm install in all codegens"
    pushd ./codegens &>/dev/null;
    for directory in *; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory}
            echo "$codegen_name : npm install $PROD_ENV"
            pushd $directory &>/dev/null;
            npm install $PROD_ENV;
            popd &>/dev/null;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done
    popd &>/dev/null;
fi
