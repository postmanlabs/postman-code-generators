#!/bin/bash
set -ev; # stop on error
echo "Creating test files and adding paths to collection for testing form data file uploads"
pushd /home/travis/build/postmanlabs/postman-code-generators/ &>/dev/null;
  echo "Sample file 1" >> test1.txt;
  echo "Sample file 2" >> test2.txt;
  echo "Sample file 3" >> test3.txt;
  node ./npm/addPathToFormdataFile.js
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/java-okhttp"
pushd ./codegens/java-okhttp &>/dev/null;
  sudo add-apt-repository ppa:openjdk-r/ppa -y
  sudo rm -rf /var/lib/apt/lists/*
  sudo apt-get update
  sudo apt-get install -y openjdk-8-jdk
  sudo wget http://central.maven.org/maven2/com/squareup/okhttp3/okhttp/3.9.1/okhttp-3.9.1.jar
  sudo wget http://central.maven.org/maven2/com/squareup/okio/okio/1.14.0/okio-1.14.0.jar
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/java-unirest"
pushd ./codegens/java-unirest &>/dev/null;
  sudo wget http://central.maven.org/maven2/com/mashape/unirest/unirest-java/1.4.9/unirest-java-1.4.9.jar
  sudo wget http://central.maven.org/maven2/org/apache/httpcomponents/httpclient/4.5.2/httpclient-4.5.2.jar
  sudo wget http://central.maven.org/maven2/commons-codec/commons-codec/1.9/commons-codec-1.9.jar
  sudo wget http://central.maven.org/maven2/commons-logging/commons-logging/1.2/commons-logging-1.2.jar
  sudo wget http://central.maven.org/maven2/org/apache/httpcomponents/httpcore/4.4.4/httpcore-4.4.4.jar
  sudo wget http://central.maven.org/maven2/org/apache/httpcomponents/httpasyncclient/4.1.1/httpasyncclient-4.1.1.jar
  sudo wget http://central.maven.org/maven2/org/apache/httpcomponents/httpcore-nio/4.4.4/httpcore-nio-4.4.4.jar
  sudo wget http://central.maven.org/maven2/org/json/json/20160212/json-20160212.jar
  sudo wget http://central.maven.org/maven2/org/apache/httpcomponents/httpmime/4.3.6/httpmime-4.3.6.jar
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/csharp-restsharp"
pushd ./codegens/csharp-restsharp &>/dev/null;
  wget -q https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
  sudo dpkg -i packages-microsoft-prod.deb
  sudo apt-get install apt-transport-https
  sudo apt-get update
  sudo apt-get install dotnet-sdk-2.2
  dotnet new console -o testProject
  pushd ./testProject &>/dev/null;
  dotnet add package RestSharp
  popd &>/dev/null;
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/php-httprequest2"
  pear install HTTP_Request2-2.3.0

echo "Installing dependencies required for tests in codegens/swift"
pushd ./codegens/swift &>/dev/null;
  sudo apt-get update
  sudo apt-get install clang-3.6 libicu-dev libpython2.7 -y
  sudo apt-get install libcurl3 libpython2.7-dev -y
  sudo wget https://swift.org/builds/swift-5.0.1-release/ubuntu1604/swift-5.0.1-RELEASE/swift-5.0.1-RELEASE-ubuntu16.04.tar.gz
  sudo tar xzf swift-5.0.1-RELEASE-ubuntu16.04.tar.gz
  sudo chmod 777 swift-5.0.1-RELEASE-ubuntu16.04/usr/lib/swift/CoreFoundation/module.map
popd &>/dev/null;

echo "Installing dependencies required for tests in codegens/csharp-restsharp"
sudo apt-get install -y mono-complete

echo "Installing dependencies required for tests in codegens/shell-httpie"
sudo apt-get install httpie
