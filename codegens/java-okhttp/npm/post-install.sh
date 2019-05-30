#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    - sudo add-apt-repository ppa:openjdk-r/ppa
    - sudo apt-get update && apt-get install -y --force-yes openjdk-8-jdk;
    - sudo mkdir dependencies
    - cd dependencies
    - sudo wget http://central.maven.org/maven2/com/squareup/okhttp3/okhttp/3.9.1/okhttp-3.9.1.jar
    - sudo wget http://central.maven.org/maven2/com/squareup/okio/okio/1.14.0/okio-1.14.0.jar
    - sudo touch main.java
    - cd ..
fi