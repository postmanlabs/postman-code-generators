#!/bin/bash
set -e;
if [ $CI ]; 
  then
    echo "Installing additional dependencies"
    - add-apt-repository ppa:openjdk-r/ppa
    - apt-get update && apt-get install -y --force-yes openjdk-8-jdk;
    - mkdir dependencies
    - cd dependencies
    - wget http://central.maven.org/maven2/com/mashape/unirest/unirest-java/1.4.9/unirest-java-1.4.9.jar
    - wget http://central.maven.org/maven2/org/apache/httpcomponents/httpclient/4.5.2/httpclient-4.5.2.jar
    - wget http://central.maven.org/maven2/commons-codec/commons-codec/1.9/commons-codec-1.9.jar
    - wget http://central.maven.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.jar
    - wget http://central.maven.org/maven2/org/apache/httpcomponents/httpcore/4.4.4/httpcore-4.4.4.jar
    - wget http://central.maven.org/maven2/org/apache/httpcomponents/httpasyncclient/4.1.1/httpasyncclient-4.1.1.jar
    - wget http://central.maven.org/maven2/org/apache/httpcomponents/httpcore-nio/4.4.4/httpcore-nio-4.4.4.jar
    - wget http://central.maven.org/maven2/org/json/json/20160212/json-20160212.jar
    - wget http://central.maven.org/maven2/org/apache/httpcomponents/httpmime/4.3.6/httpmime-4.3.6.jar
    - touch main.java
    - cd ..
fi