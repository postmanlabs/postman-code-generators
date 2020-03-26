const utils = require('./util'),
  httpCodegen = require('./../../http/index');

/**
 * Used in order to get additional options for generation of C# code snippet (i.e. Include Boilerplate code)
 *
 * @module getOptions
 *
 * @returns {Array} Additional options specific to generation of http code snippet
 */
function getOptions () {
  return [{
    name: 'Trim request body fields',
    id: 'trimRequestBody',
    type: 'boolean',
    default: false,
    description: 'Remove white space and additional lines that may affect the server\'s response'
  }];
}

/**
 * Converts a Postman SDK request to HTTP message
 *
 * @param {Object} request - Postman SDK request
 * @param {Object} options - Options for converter
 * @param {Boolean} options.trimRequestBody - determines whether to trim the body or not
 * @param {Function} callback callback
 * @returns {Function} returns the snippet with the callback function.
 */
function convert (request, options, callback) {
  httpCodegen.convert(request, options, (error, httpSnippet) => {
    const clientSnippet = utils.getClientHttpSnippet(httpSnippet),
      port = utils.getPort(request),
      host = utils.getHost(request);

    let arduinoSnippet = '';
    arduinoSnippet += '#include <SPI.h>\n';
    arduinoSnippet += '#include <WiFiNINA.h>\n';
    arduinoSnippet += '\n';
    arduinoSnippet += 'char ssid[] = "myNetwork";    //  your network SSID (name)\n';
    arduinoSnippet += 'char pass[] = "myPassword";   // your network password\n';
    arduinoSnippet += '\n';
    arduinoSnippet += 'int status = WL_IDLE_STATUS;\n';
    arduinoSnippet += `char server[] = "${host}";\n`;
    arduinoSnippet += '\n';
    arduinoSnippet += 'WiFiClient client;\n';
    arduinoSnippet += '\n';
    arduinoSnippet += 'void setup() {\n';
    arduinoSnippet += '  Serial.begin(9600);\n';
    arduinoSnippet += '  Serial.println("Attempting to connect to WPA network...");\n';
    arduinoSnippet += '  Serial.print("SSID: ");\n';
    arduinoSnippet += '  Serial.println(ssid);\n';
    arduinoSnippet += '\n';
    arduinoSnippet += '  status = WiFi.begin(ssid, pass);\n';
    arduinoSnippet += '  if ( status != WL_CONNECTED) {\n';
    arduinoSnippet += '    Serial.println("Couldn\'t get a wifi connection");\n';
    arduinoSnippet += '    while(true);\n';
    arduinoSnippet += '  }\n';
    arduinoSnippet += '  else {\n';
    arduinoSnippet += '    Serial.println("Connected to wifi");\n';
    arduinoSnippet += '    Serial.println("\nStarting connection...");\n';
    arduinoSnippet += `    if (client.connect(server, ${port})) {\n`;
    arduinoSnippet += '      Serial.println("connected");\n';
    arduinoSnippet += clientSnippet;
    arduinoSnippet += '    }\n';
    arduinoSnippet += '  }\n';
    arduinoSnippet += '}\n';
    arduinoSnippet += '\n';
    arduinoSnippet += 'void loop() {\n';
    arduinoSnippet += '  printResponse();\n';
    arduinoSnippet += '}\n';
    arduinoSnippet += '\n';
    arduinoSnippet += 'void printResponse() {\n';
    arduinoSnippet += '  while (client.available()) {\n';
    arduinoSnippet += '    char c = client.read();\n';
    arduinoSnippet += '    Serial.write(c);\n';
    arduinoSnippet += '  }\n';
    arduinoSnippet += '}\n';

    return callback(error, arduinoSnippet);
  });
}

module.exports = {
  getOptions: getOptions,
  convert: convert
};
