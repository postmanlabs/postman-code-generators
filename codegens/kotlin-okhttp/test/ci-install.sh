#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/kotlin-okhttp"
pushd ./codegens/kotlin-okhttp &>/dev/null;
  sudo add-apt-repository ppa:openjdk-r/ppa -y
  sudo rm -rf /var/lib/apt/lists/*
  sudo apt-get update
  sudo apt-get install -y openjdk-8-jdk
  sudo snap install --classic kotlin
  unzip test/unit/fixtures/dependencies.zip
popd &>/dev/null;
