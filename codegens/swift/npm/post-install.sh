#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo apt-get update -y
    sudo apt-get install libicu-dev -y
    sudo apt-get install clang-3.6 -y
    sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100
    sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100
    sudo apt-get install libcurl3 libpython2.7 libpython2.7-dev -y
    sudo wget https://swift.org/builds/swift-4.2.4-release/ubuntu1604/swift-4.2.4-RELEASE/swift-4.2.4-RELEASE-ubuntu16.04.tar.gz
    sudo tar xzf swift-4.2.4-RELEASE-ubuntu16.04.tar.gz
    swift --version
fi
