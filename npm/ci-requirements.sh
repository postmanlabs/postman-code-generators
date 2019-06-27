#!/bin/bash
set -ev; # stop on error

# Additional dependencies required to run tests on travis, these will be only installed on the CI pipeline. 

echo "Installing dependencies required for tests in codegens/golang"

sudo add-apt-repository -y ppa:jonathonf/golang
sudo apt-get update
sudo apt-get install -y golang-go

echo "Installing dependencies required for tests in codegens/php-curl"

sudo apt-get install -y php5 php5-cli php5-curl

echo "Installing dependencies required for tests in codegens/python-requests and shell-httpie"
sudo apt-get -y install python-pip
pip install requests

echo "Installing dependencies required for tests in codegens/shell-httpie"
sudo pip install httpie

echo "Installing dependencies required for tests in codegens/swift"
pushd ./codegens/swift &>/dev/null;
  sudo apt-get install libicu-dev git -y
  sudo apt-get install clang-3.6 -y
  sudo update-alternatives --install /usr/bin/clang clang /usr/bin/clang-3.6 100
  sudo update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-3.6 100
  sudo apt-get install libcurl3 libpython2.7 libpython2.7-dev -y
  sudo wget https://swift.org/builds/swift-4.2.1-release/ubuntu1404/swift-4.2.1-RELEASE/swift-4.2.1-RELEASE-ubuntu14.04.tar.gz
  sudo tar xzf swift-4.2.1-RELEASE-ubuntu14.04.tar.gz
popd &>/dev/null;