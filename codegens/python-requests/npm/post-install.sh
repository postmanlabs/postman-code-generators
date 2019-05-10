#!/bin/bash
set -e;
echo "Checking for CI flag"
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    apt-get update
    apt-get -y install python-pip
    pip install requests
fi