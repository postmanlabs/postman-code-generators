#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo apt-get update -y
    sudo apt-get install clang libicu-dev git -y
    sudo apt-get install clang-3.6 -y
    sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100
    sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100
    sudo apt-get install libcurl3 libpython2.7 libpython2.7-dev -y
    mkdir .swiftenv
    git clone https://github.com/kylef/swiftenv ~/.swiftenv
    sudo echo 'export SWIFTENV_ROOT="$HOME/.swiftenv"' >> ~/.bashrc
    sudo echo 'export PATH="$SWIFTENV_ROOT/bin:$PATH"' >> ~/.bashrc
    sudo echo 'eval "$(swiftenv init -)"' >> ~/.bashrc
    source ~/.bashrc
    swiftenv install https://swift.org/builds/swift-4.2.1-release/ubuntu1404/swift-4.2.1-RELEASE/swift-4.2.1-RELEASE-ubuntu14.04.tar.gz
    swift --version
fi