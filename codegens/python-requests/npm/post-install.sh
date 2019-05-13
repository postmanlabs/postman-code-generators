#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo apt-get update
    sudo apt-get -y install python-pip
    pip install requests
fi