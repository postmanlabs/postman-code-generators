#!/bin/bash
set -ev; # stop on error

sudo apt-get update

echo "Installing dependencies required for tests in codegens/libcurl"
sudo apt-get install libcurl4-gnutls-dev
