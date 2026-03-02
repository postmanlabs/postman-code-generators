#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/java-unirest"
pushd ./codegens/java-unirest &>/dev/null;
  unzip test/unit/fixtures/dependencies.zip
popd &>/dev/null;
