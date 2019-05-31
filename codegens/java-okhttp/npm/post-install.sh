#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    sudo add-apt-repository ppa:openjdk-r/ppa -y
     echo "apt-get update && apt-get install -y openjdk-8-jdk"
    sudo apt-get update && apt-get install -y openjdk-8-jdk;
     echo "mkdir dependencies"
    sudo mkdir dependencies
     echo "cd dependencies"
    cd dependencies
     echo "wget http://central.maven.org/maven2/com/squareup/okhttp3/okhttp/3.9.1/okhttp-3.9.1.jar"
    sudo wget http://central.maven.org/maven2/com/squareup/okhttp3/okhttp/3.9.1/okhttp-3.9.1.jar
     echo "wget http://central.maven.org/maven2/com/squareup/okio/okio/1.14.0/okio-1.14.0.jar"
    sudo wget http://central.maven.org/maven2/com/squareup/okio/okio/1.14.0/okio-1.14.0.jar
     echo "touch main.java"
    sudo touch main.java
     echo "cd .."
    cd ..
fi
