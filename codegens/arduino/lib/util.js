/**
 * Get the client code snippet
 *
 * @param {String} httpSnippet - snippet of http messages
 * @returns {String} returns the snippet.
 */
function getClientHttpSnippet (httpSnippet) {
  let snippet = '';
  httpSnippet.split(/\n/).forEach((line) => {
    snippet += `      client.println(${line})\n`;
  });
  return snippet;
}

/**
 * Get the host value from a request object
 *
 * @param {Object} request - Postman SDK request
 * @returns {String} returns the host value.
 */
// eslint-disable-next-line no-unused-vars
function getHost (request) {
  return 'example.com';
}

/**
 * Get the target port of the request
 *
 * @param {Object} request - Postman SDK request
 * @returns {String} returns the port value.
 */
// eslint-disable-next-line no-unused-vars
function getPort (request) {
  return '80';
}

module.exports = {
  getClientHttpSnippet: getClientHttpSnippet,
  getHost: getHost,
  getPort: getPort
};
