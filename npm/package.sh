#!/bin/bash
set -e; # stop on error

# ensure that the working tree is clean before packaging
source ./npm/package/require_clean_work_tree.sh;
require_clean_work_tree "create package";

if [ -n "$1" ];
then
    CODEGEN=$1 # Code gen where npm install is desired to run , first input argument
    if [ ! -d "./codegens/$CODEGEN" ]; 
    then
        echo "Codegen $CODEGEN doesn't exist, please enter valid name";
        exit 1;
    fi
    echo "Creating package for $1";
    npm run deepinstall $1;
    npm run test $1;
    npm run zip $1;
    exit 0;
else
    echo "Packaging all the codegens"
    for directory in codegens/*; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory:9} # directory contains codegens/js-jquery, we need to pass js-jquery
            echo "Creating package for $codegen_name";
            npm run deepinstall $codegen_name; 
            npm run test $codegen_name;
            npm run zip $codegen_name;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done
fi
