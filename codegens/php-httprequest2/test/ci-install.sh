#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/php-httprequest2"
pear install HTTP_Request2-2.3.0
