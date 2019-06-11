#!/bin/bash
set -e; # stop on error

if [ $DEVMODE ]
then 
    echo "DEVMODE flag detected, running tests in dev mode"
    npm run deepinstall dev
else
    echo "Running deep-install of all codegens in production mode"
    npm run deepinstall
fi
