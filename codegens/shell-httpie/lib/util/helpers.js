var Sanitize = require('./sanitize'),
  _ = require('../lodash');

const BOUNDARY_HASH = 'e4dgoae5mIkjFjfG',
  URLENCODED = 'urlencoded',
  FORM_DATA = 'formdata',
  RAW = 'raw',
  GRAPHQL = 'graphql';
  // APP_JSON = 'application/json',
  // APP_JS = 'application/javascript',
  // APP_XML = 'application/xml',
  // TEXT_XML = 'text/xml',
  // TEXT_PLAIN = 'text/plain',
  // TEXT_HTML = 'text/html';

/**
 * Used to parse the body of the postman SDK-request and return in the desired format
 *
 * @param  {Object} request - postman SDK-request object
 * @returns {String} - request body
 */
module.exports = {

  boundaryHash: BOUNDARY_HASH,
  contentType: '',

  // function to add headers to the shell snippet
  // returns headerString, comprising of all headers present in the request object
  addHeaders: function (request) {
    var headerString = '';
    if (request.hasOwnProperty('headers')) {
      if (Array.isArray(request.headers.members) && request.headers.members.length) {
        request.headers.members = _.reject(request.headers.members, 'disabled');
        headerString = request.headers.members.map((header) => {
          return ' ' + header.key.trim() + ':' + Sanitize.quote(header.value);
        }).join(' \\\n');
      }
      else {
        headerString = '';
      }
    }

    if (headerString === []) {
      return '';
    }
    return headerString;
  },

  /**
   * parses host of request object and returns code snippet of nodejs native to add hostname
   *
   * @param {Object} request - Postman SDK request object
   * @returns {String} - code snippet of nodejs native to add hostname
   */
  addHost: function (request) {
    var hostArray = _.get(request, 'url.host', []),
      hostSnippet = '';

    if (hostArray && hostArray.length) {
      hostSnippet += _.reduce(hostArray, function (accumalator, key) {
        accumalator.push(`${key}`);
        return accumalator;
      }, []).join('.');
    }

    return hostSnippet;
  },

  /**
   * parses port of request object and returns code snippet of shell httpie to add port
   *
   * @param {Object} request - Postman SDK request object
   * @returns {String} - code snippet of shell httpie to add port
   */

  addPort: function (request) {
    var port = request.url.port,
      portSnippet = '';
    if (port) {
      portSnippet += ':' + port;
    }
    return portSnippet;
  },

  addPathandQuery: function (request) {
    var pathArray = _.get(request, 'url.path'),
      queryArray = _.get(request.toJSON(), 'url.query'),
      pathSnippet = '/',
      querySnippet = '';

    if (pathArray && pathArray.length) {
      pathSnippet += _.reduce(pathArray, function (accumalator, key) {
        if (key.length) {
          accumalator.push(`${key}`);
        }
        else {
          accumalator.push('');
        }
        return accumalator;
      }, []).join('/');
    }

    if (queryArray && queryArray.length) {
      const queryExists = !(_.every(queryArray, function (element) {
        return element.disabled && element.disabled === false;
      }));

      if (queryExists) {
        querySnippet += ' ' + _.reduce(queryArray, function (accumalator, queryElement) {
          if (!queryElement.disabled || _.get(queryElement, 'disabled') === false) {
            accumalator.push(`${Sanitize.quote(queryElement.key)}==${Sanitize.quote(queryElement.value)}`);
          }
          return accumalator;
        }, []).join(' ');
      }
    }
    pathSnippet += querySnippet;
    return pathSnippet;
  },

  /**
 * parses variable of request url object and sets hostname, path and query in request object
 *
 * @param {Object} request - Postman SDK request object
 */
  parseURLVariable: function (request) {
    const variableArray = _.get(request.toJSON(), 'url.variable', []);

    if (!variableArray.length) {
      return;
    }

    variableArray.forEach(function (variableArrayElement) {
      if (variableArrayElement.value) {
        request.url.host.forEach(function (hostArrayElement, hostArrayElementIndex) {
          if (hostArrayElement === ':' + variableArrayElement.key) {
            request.url.host[hostArrayElementIndex] = variableArrayElement.value;
          }
        });

        request.url.path.forEach(function (pathArrayElement, pathArrayElementIndex) {
          if (pathArrayElement === ':' + variableArrayElement.key) {
            request.url.path[pathArrayElementIndex] = variableArrayElement.value;
          }
        });

        request.toJSON().url.query.forEach(function (queryArrayElement, queryArrayElementIndex) {
          if (queryArrayElement === ':' + variableArrayElement.key) {
            request.url.query[queryArrayElementIndex] = variableArrayElement.value;
          }
        });
      }
    });
  },

  getRequestBody: function (requestBody, contentCategory) {
    var parsedBody;

    switch (contentCategory) {
      case URLENCODED:
        if (Array.isArray(requestBody.members) && requestBody.members.length) {
          parsedBody = requestBody.members.map((param) => {
            if (typeof param.value === 'string') {
              return ' ' + Sanitize.quote(param.key) + '=' + Sanitize.quote(param.value);
            }
            return ' ' + param.key + ':=' + param.value;
          }).join(' \\\n');
        }
        else {
          parsedBody = '';
        }
        break;

      case FORM_DATA:
        if (Array.isArray(requestBody.members) && requestBody.members.length) {
          parsedBody = requestBody.members.map((param) => {
            if (param.type === 'text') {
              if (typeof param.value === 'string') {
                return ' ' + Sanitize.quote(param.key) + '=' + Sanitize.quote(param.value);
              }
              return ' ' + param.key + ':=' + param.value;
            }
            return ' ' + Sanitize.quote(param.key) + '@' + param.src;
          }).join(' \\\n');
        }
        else {
          parsedBody = '';
        }
        break;

      case RAW:
        if (requestBody === undefined) {
          parsedBody = '';
        }
        else {
          parsedBody = requestBody ? `${Sanitize.quote(requestBody, RAW)}` : '';
        }
        break;
      // eslint-disable-next-line no-case-declarations
      case GRAPHQL:
        let query = requestBody.query,
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(requestBody.variables);
        }
        catch (e) {
          graphqlVariables = {};
        }
        parsedBody = Sanitize.quote(JSON.stringify({
          query: query,
          variables: graphqlVariables
        }), RAW);
        break;
      case 'file':
        parsedBody = requestBody.src;
        break;
      default:
        parsedBody = '';
    }

    return parsedBody ? parsedBody : '';
  }
};
