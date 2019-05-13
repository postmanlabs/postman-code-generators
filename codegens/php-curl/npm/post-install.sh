#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo LC_ALL=C.UTF-8 add-apt-repository -y ppa:ondrej/php
    sudo apt-get update && apt-get install -y --force-yes php5.6-cli php-curl
fi
