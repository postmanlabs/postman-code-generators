#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/swift"
pushd ./codegens/swift &>/dev/null;
  sudo apt-get update
  sudo apt-get install clang-3.6 libicu-dev libpython2.7 -y
  sudo apt-get install libcurl4 libpython2.7-dev -y
  sudo wget -q https://download.swift.org/swift-5.7.3-release/ubuntu2004/swift-5.7.3-RELEASE/swift-5.7.3-RELEASE-ubuntu20.04.tar.gz
  sudo tar xzf swift-5.7.3-RELEASE-ubuntu20.04.tar.gz
  sudo chmod 777 swift-5.7.3-RELEASE-ubuntu20.04/usr/lib/swift/CoreFoundation/module.map
popd &>/dev/null;
