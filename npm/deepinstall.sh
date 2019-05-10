#!/bin/bash
set -e; # stop on error
if [ -n $CI ]; 
then
  echo "CI flag is set"
fi

if [ -n "$1" ];
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
    popd &>/dev/null;
    exit 0;
else
    echo "Running npm install in all codegens"
    pushd ./codegens &>/dev/null;
    for directory in *; do
        if [ -d ${directory} ]; 
        then
            codegen_name=${directory}
            echo "$codegen_name : npm install "
            pushd $directory &>/dev/null;
            npm install;
            popd &>/dev/null;
        else
            echo "No Code gen folders present";
            exit 0;
        fi
    done
    popd &>/dev/null;
fi
