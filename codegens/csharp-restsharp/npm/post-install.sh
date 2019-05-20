#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo apt-get update
    sudo apt-get install -y mono-complete
    mcs --version
    mono -V
fi