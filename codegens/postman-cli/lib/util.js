const _ = require('./lodash');

var self = module.exports = {
  /**
     * sanitizes input string by handling escape characters eg: converts '''' to '\'\'', (" to \"  and \ to \\ )
     * and trim input if required
     *
     * @param {String} inputString
     * @param {Boolean} [trim] - indicates whether to trim string or not
     * @param {String} [quoteType] - indicates which quoteType has to be escaped
     * @param {Boolean} [backSlash] - indicates whether to escape backslash(\\)
     * @param {Boolean} [urlEncode] - indicates whether to url-encode inputString
     * @returns {String}
     */
  sanitize: function (inputString, trim, quoteType, backSlash = false, urlEncode = false) {
    if (typeof inputString !== 'string') {
      return '';
    }

    if (urlEncode) {
      inputString = encodeURIComponent(inputString);
    }

    if (backSlash) {
      inputString = inputString.replace(/\\/g, '\\\\');
    }

    if (quoteType === '"') {
      inputString = inputString.replace(/"/g, '\\"');
      // Escape backslash if double quote was already escaped before call to sanitize
      inputString = inputString.replace(/(?<!\\)\\\\"/g, '\\\\\\"');

      // Escape special characters to preserve their literal meaning within double quotes
      inputString = inputString
        .replace(/`/g, '\\`')
        .replace(/#/g, '\\#')
        .replace(/\$/g, '\\$')
        .replace(/!/g, '\\!');
    }
    else if (quoteType === '\'') {
      // for shell escaping of single quotes inside single quotes involves changing of ' to '\''
      inputString = inputString.replace(/'/g, "'\\''"); // eslint-disable-line quotes
    }

    return trim ? inputString.trim() : inputString;
  },

  form: function (option, format) {
    if (format) {
      switch (option) {
        case '-H':
          return '--header';
        case '-d':
          return '--body';
        case '-f':
          return '--form';
        case '-e':
          return '--environment';
        case '-o':
          return '--output';
        case '-q':
          return '--quiet';
        default:
          return option;
      }
    }
    else {
      return option;
    }
  },

  /**
    * sanitizes input options
    *
    * @param {Object} options - Options provided by the user
    * @param {Array} optionsArray - options array received from getOptions function
    *
    * @returns {Object} - Sanitized options object
    */
  sanitizeOptions: function (options, optionsArray) {
    var result = {},
      defaultOptions = {},
      id;
    optionsArray.forEach((option) => {
      defaultOptions[option.id] = {
        default: option.default,
        type: option.type
      };
      if (option.type === 'enum') {
        defaultOptions[option.id].availableOptions = option.availableOptions;
      }
    });

    for (id in options) {
      if (options.hasOwnProperty(id)) {
        if (defaultOptions[id] === undefined) {
          continue;
        }
        switch (defaultOptions[id].type) {
          case 'boolean':
            if (typeof options[id] !== 'boolean') {
              result[id] = defaultOptions[id].default;
            }
            else {
              result[id] = options[id];
            }
            break;
          case 'positiveInteger':
            if (typeof options[id] !== 'number' || options[id] < 0) {
              result[id] = defaultOptions[id].default;
            }
            else {
              result[id] = options[id];
            }
            break;
          case 'enum':
            if (!defaultOptions[id].availableOptions.includes(options[id])) {
              result[id] = defaultOptions[id].default;
            }
            else {
              result[id] = options[id];
            }
            break;
          default:
            result[id] = options[id];
        }
      }
    }

    for (id in defaultOptions) {
      if (defaultOptions.hasOwnProperty(id)) {
        if (result[id] === undefined) {
          result[id] = defaultOptions[id].default;
        }
      }
    }
    return result;
  },

  /**
   * Generates args required for NTLM authentication to happen
   *
   * @param {*} auth - The request sdk request.auth object
   * @param {string} quoteType - user provided option to decide whether to use single or double quotes
   * @param {string} format - user provided option to decide whether to use long format or not
   * @returns {string} - The string to be added if NTLM auth is required
   */
  getNtlmAuthInfo: function (auth, quoteType, format) {
    const ntlmAuth = auth && auth.ntlm;

    if (!auth || auth.type !== 'ntlm' || !ntlmAuth || !ntlmAuth.count || !ntlmAuth.count()) {
      return '';
    }

    const username = ntlmAuth.has('username') && ntlmAuth.get('username'),
      password = ntlmAuth.has('password') && ntlmAuth.get('password'),
      domain = ntlmAuth.has('domain') && ntlmAuth.get('domain');

    if (!username && !password) {
      return '';
    }

    var userArg = format ? '--user ' : '-u ',
      ntlmString = ' --ntlm ' + userArg + quoteType;

    if (domain) {
      ntlmString += self.sanitize(domain, true, quoteType) + '\\';
    }
    ntlmString += self.sanitize(username, true, quoteType) + ':' + self.sanitize(password, true, quoteType);
    ntlmString += quoteType;

    return ntlmString;
  },

  /**
   *
   * @param {*} urlObject The request sdk request.url object
   * @param {boolean} quoteType The user given quoteType
   * @returns {String} The final string after parsing all the parameters of the url including
   * protocol, auth, host, port, path, query, hash
   * This will be used because the url.toString() method returned the URL with non encoded query string
   * and hence a manual call is made to getQueryString() method with encode option set as true.
   */
  getUrlStringfromUrlObject: function (urlObject, quoteType) {
    var url = '';
    if (!urlObject) {
      return url;
    }
    if (urlObject.protocol) {
      url += (urlObject.protocol.endsWith('://') ? urlObject.protocol : urlObject.protocol + '://');
    }
    if (urlObject.auth && urlObject.auth.user) {
      url = url + ((urlObject.auth.password) ?
      // ==> username:password@
        urlObject.auth.user + ':' + urlObject.auth.password : urlObject.auth.user) + '@';
    }
    if (urlObject.host) {
      url += urlObject.getHost();
    }
    if (urlObject.port) {
      url += ':' + urlObject.port.toString();
    }
    if (urlObject.path) {
      url += urlObject.getPath();
    }
    if (urlObject.query && urlObject.query.count()) {
      let queryString = self.getQueryString(urlObject);
      queryString && (url += '?' + queryString);
    }
    if (urlObject.hash) {
      url += '#' + urlObject.hash;
    }

    return self.sanitize(url, false, quoteType);
  },

  /**
   * @param {Object} urlObject
   * @returns {String}
   */
  getQueryString: function (urlObject) {
    let isFirstParam = true,
      params = _.get(urlObject, 'query.members'),
      result = '';
    if (Array.isArray(params)) {
      result = _.reduce(params, function (result, param) {
        if (param.disabled === true) {
          return result;
        }

        if (isFirstParam) {
          isFirstParam = false;
        }
        else {
          result += '&';
        }

        return result + self.encodeParam(param.key) + '=' + self.encodeParam(param.value);
      }, result);
    }

    return result;
  },

  /**
   * Encode param except the following characters- [,{,},],%,+
   *
   * @param {String} param
   * @returns {String}
   */
  encodeParam: function (param) {
    return encodeURIComponent(param)
      .replace(/%5B/g, '[')
      .replace(/%7B/g, '{')
      .replace(/%5D/g, ']')
      .replace(/%7D/g, '}')
      .replace(/%2B/g, '+')
      .replace(/%25/g, '%')
      .replace(/'/g, '%27');
  },

  /**
 *
 * @param {Array} array - form data array
 * @param {String} key - key of form data param
 * @param {String} type - type of form data param(file/text)
 * @param {String} val - value/src property of form data param
 * @param {String} disabled - Boolean denoting whether the param is disabled or not
 * @param {String} contentType - content type header of the param
 *
 * Appends a single param to form data array
 */
  addFormParam: function (array, key, type, val, disabled, contentType) {
    if (type === 'file') {
      array.push({
        key: key,
        type: type,
        src: val,
        disabled: disabled,
        contentType: contentType
      });
    }
    else {
      array.push({
        key: key,
        type: type,
        value: val,
        disabled: disabled,
        contentType: contentType
      });
    }
  },

  /**
   * @param {Object} body
   * @returns {boolean}
   *
   * Determines if a request body is actually empty.
   * This is needed because body.isEmpty() returns false for formdata
   * and urlencoded when they contain only disabled params which will not
   * be a part of the CLI request.
   */
  isBodyEmpty (body) {
    if (!body) {
      return true;
    }

    if (body.isEmpty()) {
      return true;
    }

    if (body.mode === 'formdata' || body.mode === 'urlencoded') {
      let memberCount = 0;
      body[body.mode] && body[body.mode].members && body[body.mode].members.forEach((param) => {
        if (!param.disabled) {
          memberCount += 1;
        }
      });

      return memberCount === 0;
    }

    return false;
  },

  /**
   * Generates authentication flags for Postman CLI based on request auth configuration
   *
   * @param {Object} auth - The request.auth object from Postman SDK
   * @param {String} quoteType - User provided option to decide whether to use single or double quotes
   * @param {String} indent - Indentation string
   * @returns {String} - The authentication flags to be added to the CLI command
   */
  getAuthFlags: function (auth, quoteType, indent) {
    if (!auth || !auth.type) {
      return '';
    }

    var authType = auth.type,
      authData = auth[authType],
      authFlags = '',
      getAuthParam = function (paramName) {
        if (!authData || !authData.members) {
          return '';
        }
        var param = authData.members.find(function (item) { return item.key === paramName; });
        return param ? param.value : '';
      },
      username, password, realm, nonce, algorithm, qop, nc, cnonce, opaque, token, tokenSecret,
      consumerKey, consumerSecret, signatureMethod, timestamp, version, addParamsToHeader,
      addEmptyParamsToSign, accessToken, addTokenTo, authId, authKey, user, extraData, app,
      delegation, domain, workstation, key, value, inParam;

    switch (authType) {
      case 'basic':
        username = getAuthParam('username');
        password = getAuthParam('password');
        if (username || password) {
          authFlags += indent + '--auth-basic-username ' + quoteType +
            self.sanitize(username, true, quoteType) + quoteType;
          authFlags += indent + '--auth-basic-password ' + quoteType +
            self.sanitize(password, true, quoteType) + quoteType;
        }
        break;

      case 'bearer':
        token = getAuthParam('token');
        if (token) {
          authFlags += indent + '--auth-bearer-token ' + quoteType +
            self.sanitize(token, true, quoteType) + quoteType;
        }
        break;

      case 'digest':
        username = getAuthParam('username');
        password = getAuthParam('password');
        realm = getAuthParam('realm');
        nonce = getAuthParam('nonce');
        algorithm = getAuthParam('algorithm');
        qop = getAuthParam('qop');
        nc = getAuthParam('nc');
        cnonce = getAuthParam('cnonce');
        opaque = getAuthParam('opaque');

        if (username) {
          authFlags += indent + '--auth-digest-username ' + quoteType +
            self.sanitize(username, true, quoteType) + quoteType;
        }
        if (password) {
          authFlags += indent + '--auth-digest-password ' + quoteType +
            self.sanitize(password, true, quoteType) + quoteType;
        }
        if (realm) {
          authFlags += indent + '--auth-digest-realm ' + quoteType +
            self.sanitize(realm, true, quoteType) + quoteType;
        }
        if (nonce) {
          authFlags += indent + '--auth-digest-nonce ' + quoteType +
            self.sanitize(nonce, true, quoteType) + quoteType;
        }
        if (algorithm) {
          authFlags += indent + '--auth-digest-algorithm ' + quoteType +
            self.sanitize(algorithm, true, quoteType) + quoteType;
        }
        if (qop) {
          authFlags += indent + '--auth-digest-qop ' + quoteType +
            self.sanitize(qop, true, quoteType) + quoteType;
        }
        if (nc) {
          authFlags += indent + '--auth-digest-nc ' + quoteType +
            self.sanitize(nc, true, quoteType) + quoteType;
        }
        if (cnonce) {
          authFlags += indent + '--auth-digest-cnonce ' + quoteType +
            self.sanitize(cnonce, true, quoteType) + quoteType;
        }
        if (opaque) {
          authFlags += indent + '--auth-digest-opaque ' + quoteType +
            self.sanitize(opaque, true, quoteType) + quoteType;
        }
        break;

      case 'oauth1':
        consumerKey = getAuthParam('consumerKey');
        consumerSecret = getAuthParam('consumerSecret');
        token = getAuthParam('token');
        tokenSecret = getAuthParam('tokenSecret');
        signatureMethod = getAuthParam('signatureMethod');
        timestamp = getAuthParam('timestamp');
        nonce = getAuthParam('nonce');
        version = getAuthParam('version');
        realm = getAuthParam('realm');
        addParamsToHeader = getAuthParam('addParamsToHeader');
        addEmptyParamsToSign = getAuthParam('addEmptyParamsToSign');

        if (consumerKey) {
          authFlags += indent + '--auth-oauth1-consumerKey ' + quoteType +
            self.sanitize(consumerKey, true, quoteType) + quoteType;
        }
        if (consumerSecret) {
          authFlags += indent + '--auth-oauth1-consumerSecret ' + quoteType +
            self.sanitize(consumerSecret, true, quoteType) + quoteType;
        }
        if (token) {
          authFlags += indent + '--auth-oauth1-token ' + quoteType +
            self.sanitize(token, true, quoteType) + quoteType;
        }
        if (tokenSecret) {
          authFlags += indent + '--auth-oauth1-tokenSecret ' + quoteType +
            self.sanitize(tokenSecret, true, quoteType) + quoteType;
        }
        if (signatureMethod) {
          authFlags += indent + '--auth-oauth1-signatureMethod ' + quoteType +
            self.sanitize(signatureMethod, true, quoteType) + quoteType;
        }
        if (timestamp) {
          authFlags += indent + '--auth-oauth1-timestamp ' + quoteType +
            self.sanitize(timestamp, true, quoteType) + quoteType;
        }
        if (nonce) {
          authFlags += indent + '--auth-oauth1-nonce ' + quoteType +
            self.sanitize(nonce, true, quoteType) + quoteType;
        }
        if (version) {
          authFlags += indent + '--auth-oauth1-version ' + quoteType +
            self.sanitize(version, true, quoteType) + quoteType;
        }
        if (realm) {
          authFlags += indent + '--auth-oauth1-realm ' + quoteType +
            self.sanitize(realm, true, quoteType) + quoteType;
        }
        if (addParamsToHeader) {
          authFlags += indent + '--auth-oauth1-addParamsToHeader ' + quoteType +
            self.sanitize(addParamsToHeader, true, quoteType) + quoteType;
        }
        if (addEmptyParamsToSign) {
          authFlags += indent + '--auth-oauth1-addEmptyParamsToSign ' + quoteType +
            self.sanitize(addEmptyParamsToSign, true, quoteType) + quoteType;
        }
        break;

      case 'oauth2':
        accessToken = getAuthParam('accessToken');
        addTokenTo = getAuthParam('addTokenTo');

        if (accessToken) {
          authFlags += indent + '--auth-oauth2-accessToken ' + quoteType +
            self.sanitize(accessToken, true, quoteType) + quoteType;
        }
        if (addTokenTo) {
          authFlags += indent + '--auth-oauth2-addTokenTo ' + quoteType +
            self.sanitize(addTokenTo, true, quoteType) + quoteType;
        }
        break;

      case 'hawk':
        authId = getAuthParam('authId');
        authKey = getAuthParam('authKey');
        algorithm = getAuthParam('algorithm');
        user = getAuthParam('user');
        nonce = getAuthParam('nonce');
        extraData = getAuthParam('extraData');
        app = getAuthParam('app');
        delegation = getAuthParam('delegation');
        timestamp = getAuthParam('timestamp');

        if (authId) {
          authFlags += indent + '--auth-hawk-authId ' + quoteType +
            self.sanitize(authId, true, quoteType) + quoteType;
        }
        if (authKey) {
          authFlags += indent + '--auth-hawk-authKey ' + quoteType +
            self.sanitize(authKey, true, quoteType) + quoteType;
        }
        if (algorithm) {
          authFlags += indent + '--auth-hawk-algorithm ' + quoteType +
            self.sanitize(algorithm, true, quoteType) + quoteType;
        }
        if (user) {
          authFlags += indent + '--auth-hawk-user ' + quoteType +
            self.sanitize(user, true, quoteType) + quoteType;
        }
        if (nonce) {
          authFlags += indent + '--auth-hawk-nonce ' + quoteType +
            self.sanitize(nonce, true, quoteType) + quoteType;
        }
        if (extraData) {
          authFlags += indent + '--auth-hawk-extraData ' + quoteType +
            self.sanitize(extraData, true, quoteType) + quoteType;
        }
        if (app) {
          authFlags += indent + '--auth-hawk-app ' + quoteType +
            self.sanitize(app, true, quoteType) + quoteType;
        }
        if (delegation) {
          authFlags += indent + '--auth-hawk-delegation ' + quoteType +
            self.sanitize(delegation, true, quoteType) + quoteType;
        }
        if (timestamp) {
          authFlags += indent + '--auth-hawk-timestamp ' + quoteType +
            self.sanitize(timestamp, true, quoteType) + quoteType;
        }
        break;

      case 'ntlm':
        username = getAuthParam('username');
        password = getAuthParam('password');
        domain = getAuthParam('domain');
        workstation = getAuthParam('workstation');

        if (username) {
          authFlags += indent + '--auth-ntlm-username ' + quoteType +
            self.sanitize(username, true, quoteType) + quoteType;
        }
        if (password) {
          authFlags += indent + '--auth-ntlm-password ' + quoteType +
            self.sanitize(password, true, quoteType) + quoteType;
        }
        if (domain) {
          authFlags += indent + '--auth-ntlm-domain ' + quoteType +
            self.sanitize(domain, true, quoteType) + quoteType;
        }
        if (workstation) {
          authFlags += indent + '--auth-ntlm-workstation ' + quoteType +
            self.sanitize(workstation, true, quoteType) + quoteType;
        }
        break;

      case 'apikey':
        key = getAuthParam('key');
        value = getAuthParam('value');
        inParam = getAuthParam('in');

        if (key) {
          authFlags += indent + '--auth-apikey-key ' + quoteType +
            self.sanitize(key, true, quoteType) + quoteType;
        }
        if (value) {
          authFlags += indent + '--auth-apikey-value ' + quoteType +
            self.sanitize(value, true, quoteType) + quoteType;
        }
        if (inParam) {
          authFlags += indent + '--auth-apikey-in ' + quoteType +
            self.sanitize(inParam, true, quoteType) + quoteType;
        }
        break;

      default:
        // Unsupported auth type, return empty string
        break;
    }

    return authFlags;
  },


  /**
   * Decide whether we should add the HTTP method explicitly to the Postman CLI command.
   *
   * @param {Object} request
   *
   * @returns {Boolean}
   */
  shouldAddHttpMethod: function (request) {

    if (request.method === 'GET') {
      return false;
    }

    return true;
    //   let followRedirect = options.followRedirect,
    //     followOriginalHttpMethod = options.followOriginalHttpMethod,
    //     disableBodyPruning = true,
    //     isBodyEmpty = self.isBodyEmpty(request.body);

    //   // eslint-disable-next-line lodash/prefer-is-nil
    //   if (request.protocolProfileBehavior !== null && request.protocolProfileBehavior !== undefined) {
    //     followRedirect = _.get(request, 'protocolProfileBehavior.followRedirects', followRedirect);
    //     followOriginalHttpMethod =
    //       _.get(request, 'protocolProfileBehavior.followOriginalHttpMethod', followOriginalHttpMethod);
    //     disableBodyPruning = _.get(request, 'protocolProfileBehavior.disableBodyPruning', true);
    //   }

    //   if (followRedirect && followOriginalHttpMethod) {
    //     return true;
    //   }

    //   switch (request.method) {
    //     case 'HEAD':
    //       return false;
    //     case 'GET':
    //       // disableBodyPruning will generally not be present in the request
    //       // the only time it will be present, its value will be _false_
    //       // i.e. the user wants to prune the request body despite it being present
    //       if (!isBodyEmpty && disableBodyPruning) {
    //         return true;
    //       }

  //       return false;
  //     case 'POST':
  //       return isBodyEmpty;
  //     case 'DELETE':
  //     case 'PUT':
  //     case 'PATCH':
  //     default:
  //       return true;
  //   }
  }
};
