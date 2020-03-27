/**
 * Get the client code snippet
 *
 * @param {String} httpSnippet - snippet of http messages
 * @returns {String} returns the snippet.
 */
function getClientHttpSnippet (httpSnippet) {
  let snippet = '';
  httpSnippet.split(/\n/).forEach((line) => {
    snippet += `      client.println(${line});\n`;
  });
  return snippet;
}

/**
 * Get the host value from a request object
 *
 * @param {Object} request - Postman SDK request
 * @returns {String} returns the host value.
 */
function getHost (request) {
  if (typeof request.url === 'string' || request.url instanceof String) {
    const url = new URL(request.url);
    return url.hostname;
  }

  return request.url.host;
}

/**
 * Get the target port of the request
 *
 * @param {Object} request - Postman SDK request
 * @returns {String} returns the port value.
 */
function getPort (request) {
  if (typeof request.url === 'string' || request.url instanceof String) {
    const url = new URL(request.url);
    if (url.port === '') {
      return url.protocol === 'https:' ? '443' : '80';
    }
    return url.port;
  }

  return request.url.port;
}

module.exports = {
  getClientHttpSnippet: getClientHttpSnippet,
  getHost: getHost,
  getPort: getPort
};
