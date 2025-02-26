#!/bin/bash
set -ev; # stop on error

echo "Installing dependencies required for tests in codegens/php-guzzle"
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/bin/composer
composer global require guzzlehttp/guzzle:7.4.1
