#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo add-apt-repository ppa:jonathonf/golang
    sudo apt-get update
    sudo apt-get install -y --force-yes golang-go
fi