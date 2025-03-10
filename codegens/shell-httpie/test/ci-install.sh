#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/shell-httpie"
sudo apt-get install httpie
