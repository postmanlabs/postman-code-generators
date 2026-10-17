#!/bin/bash
set -ev; # stop on error

sudo apt-get update
echo "Installing dependencies required for tests in codegens/csharp-httpclient"
# Install latest .net8.0 sdk
pushd ./codegens/csharp-httpclient &>/dev/null;
  wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
  sudo dpkg -i packages-microsoft-prod.deb
  sudo apt-get install apt-transport-https
  sudo apt-get update
  sudo apt-get install dotnet-sdk-8.0
  dotnet new console -o testProject -f net8.0
  # no extra packages needed
popd &>/dev/null;
