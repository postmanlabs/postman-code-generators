#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/r-httr"
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9
sudo add-apt-repository 'deb https://cloud.r-project.org/bin/linux/ubuntu focal-cran40/'
sudo apt-get update
sudo apt-get install r-base libcurl4-gnutls-dev
sudo R --vanilla -e 'install.packages("RCurl", version="1.98.1.6", repos="http://cran.us.r-project.org")'
