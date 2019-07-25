#!/bin/bash
set -ev; # stop on error
echo "Installing dependencies required for tests in codegens/java-okhttp"
pushd ./codegens/java-okhttp &>/dev/null;
  sudo add-apt-repository ppa:openjdk-r/ppa -y
  sudo apt-get update
  sudo apt-get install -y openjdk-8-jdk
  sudo wget http://central.maven.org/maven2/com/squareup/okhttp3/okhttp/3.9.1/okhttp-3.9.1.jar
  sudo wget http://central.maven.org/maven2/com/squareup/okio/okio/1.14.0/okio-1.14.0.jar
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/swift"
pushd ./codegens/swift &>/dev/null;
  sudo apt-get update
  sudo apt-get install clang-3.6 libicu-dev libpython2.7 -y
  sudo apt-get install libcurl3 libpython2.7-dev -y
  sudo wget https://swift.org/builds/swift-5.0.1-release/ubuntu1604/swift-5.0.1-RELEASE/swift-5.0.1-RELEASE-ubuntu16.04.tar.gz
  sudo tar xzf swift-5.0.1-RELEASE-ubuntu16.04.tar.gz
  sudo chmod 777 swift-5.0.1-RELEASE-ubuntu16.04/usr/lib/swift/CoreFoundation/module.map
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/csharp-restsharp"
sudo apt-get install -y mono-complete
echo "Installing dependencies required for tests in codegens/shell-httpie"
sudo apt-get install httpie
