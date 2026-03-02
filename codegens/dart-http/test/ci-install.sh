#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/dart-http"
pushd ./codegens/dart-http &>/dev/null;
  wget -q https://storage.googleapis.com/dart-archive/channels/stable/release/3.0.4/linux_packages/dart_3.0.4-1_amd64.deb
  sudo dpkg -i dart_3.0.4-1_amd64.deb
  echo '''name: test
version: 1.0.0
environment:
  sdk: ^3.0.3
dependencies:
  http: ^1.0.0
''' > pubspec.yaml
  dart pub get
popd &>/dev/null;
