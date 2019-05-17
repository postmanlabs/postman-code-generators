#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo add-apt-repository -y ppa:jonathonf/golang
    sudo apt-get update
    sudo apt-get install -y --force-yes golang-go
    ls -la npm
    ls -la ../swift/npm
fi