let _ = require('../lodash');

/**
 * @param {Object} url - The Postman URL object
 * @returns {String}
 *
 * Remove protocol from url if present
 */
function getHostWithoutProtocol (url) {
  return url.host.join('.')
    .replace(/^https?:\/\//, '');
}

/**
 * @param {Object} url - The Postman URL object
 * @returns {String}
 *
 * Return host from the URL
 */
function getHost (url) {
  return getHostWithoutProtocol(url).split('/')[0];
}

/**
 * @param {Object} url - The Postman URL object
 * @returns {String}
 *
 * Return the path from a URL
 */
function getPath (url) {
  var segments = [];
  // Sometimes url.host contains protocol as well as path
  // Extract that here
  if (getHost(url).length !== url.host.join('.').length) {
    url.path = getHostWithoutProtocol(url).split('/').slice(1).concat(url.path);
  }
  if (url.path) {
    segments = _.reduce(url.path, function (res, segment) {
      var variable;

      // check if the segment has path variable prefix followed by the variable name.
      if (segment.length > 1 && segment[0] === ':') {
        variable = url.variables.one(segment.slice(1)); // remove path variable prefix.
      }

      variable = variable && variable.valueOf && variable.valueOf();
      res.push(typeof variable === 'string' ? variable : segment);
      return res;
    }, []);
  }

  return '/' + segments.join('/'); // add leading slash
}

module.exports = {
  getHost,
  getPath
};
