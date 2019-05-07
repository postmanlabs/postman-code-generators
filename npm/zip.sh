#!/bin/bash
set -e;
CODEGEN=$1;
if [ ! -d "./codegens/$CODEGEN" ]; 
then
    echo "Codegen $CODEGEN doesn't exist, please enter valid name";
    exit 1;
fi
echo "$1 : zip";
pushd ./codegens/$CODEGEN &>/dev/null;
npm pack;
popd &>/dev/null;
