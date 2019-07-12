#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/swift"
pushd ./codegens/swift &>/dev/null;
  sudo apt-get update
  sudo apt-get install clang-3.6 libicu-dev libpython2.7 -y
  sudo apt-get install libcurl3 libpython2.7-dev -y
  sudo wget https://swift.org/builds/swift-5.0.1-release/ubuntu1604/swift-5.0.1-RELEASE/swift-5.0.1-RELEASE-ubuntu16.04.tar.gz
  sudo tar xzf swift-5.0.1-RELEASE-ubuntu16.04.tar.gz
  sudo chmod 777 swift-5.0.1-RELEASE-ubuntu16.04/usr/lib/swift/CoreFoundation/module.modulemap
  sudo export PATH=/swift-5.0.1-RELEASE-ubuntu16.04/usr/bin:$PATH
popd &>/dev/null;
