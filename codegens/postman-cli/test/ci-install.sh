#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/postman-cli"

# Install curl command-line tool (needed to download Postman CLI)
echo "Installing curl..."
sudo apt-get update
sudo apt-get install -y curl

# Install Postman CLI
echo "Installing Postman CLI..."
curl -o- "https://dl-cli.pstmn.io/install/linux64.sh" | sh
