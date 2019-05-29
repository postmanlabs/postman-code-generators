#!/bin/bash
# set -e;
# if [ $CI ]; 
#   then
#     echo "Installing additional dependencies"
#     sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
# 	sudo apt-get install apt-transport-https ca-certificates
# 	echo "deb https://download.mono-project.com/repo/ubuntu stable-xenial main" | sudo tee /etc/apt/sources.list.d/mono-official-stable.list
#     sudo apt-get update
#     sudo apt-get install -y mono-complete
#     mcs --version
#     mono -V
# fi