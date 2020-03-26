/**
 * Get the code snippet
 *
 * @returns {String} returns the snippet.
 */
function getSnippet () {
  return '#include <SPI.h>\n' +
    '#include <WiFi.h>\n' +
    '\n' +
    'char ssid[] = "myNetwork";    // your network SSID (name)\n' +
    'char pass[] = "myPassword";   // your network password\n' +
    '\n' +
    'int status = WL_IDLE_STATUS;\n' +
    'char server[] = "www.example.com";\n' +
    '\n' +
    '// Initialize the client library\n' +
    'WiFiClient client;\n' +
    '\n' +
    'void setup() {\n' +
    '  Serial.begin(9600);\n' +
    '  Serial.println("Attempting to connect to WPA network...");\n' +
    '  Serial.print("SSID: ");\n' +
    '  Serial.println(ssid);\n' +
    '\n' +
    '  status = WiFi.begin(ssid, pass);\n' +
    '  if ( status != WL_CONNECTED) {\n' +
    '    Serial.println("Couldn\'t get a wifi connection");\n' +
    '    // don\'t do anything else:\n' +
    '    while(true);\n' +
    '  }\n' +
    '  else {\n' +
    '    Serial.println("Connected to wifi");\n' +
    '    Serial.println("\nStarting connection...");\n' +
    '    // if you get a connection, report back via serial:\n' +
    '    if (client.connect(server, 80)) {\n' +
    '      Serial.println("connected");\n' +
    '      // Make a HTTP request:\n' +
    '      client.println("GET / HTTP/1.0");\n' +
    '      client.println();\n' +
    '    }\n' +
    '  }\n' +
    '}\n' +
    '\n' +
    'void loop() {\n' +
    '\n' +
    '}';
}

module.exports = {
  getSnippet: getSnippet
};
