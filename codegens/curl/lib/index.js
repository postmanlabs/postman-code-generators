const {
    sanitize,
    sanitizeOptions,
    getUrlStringfromUrlObject,
    getNtlmAuthInfo,
    addFormParam,
    form,
    shouldAddHttpMethod
} = require('./util'),
_ = require('./lodash');

var self;

self = module.exports = {

  // HELPER FUNCTION FOR AUTH
  _addAuth: function (request, snippet, format, quoteType) {
    const auth = request && request.auth;

    if (!auth || !auth.type) return snippet;

    // BASIC AUTH
    if (auth.type === 'basic' && auth.username && auth.password) {
      snippet += ` ${form('-u', format)} "${auth.username}:${auth.password}"`;
    }

    // BEARER AUTH
    else if (auth.type === 'bearer' && auth.token) {
      snippet += ` ${form('-H', format)} ${quoteType}Authorization: Bearer ${auth.token}${quoteType}`;
    }

    return snippet;
  },

  convert: function (request, options, callback) {
    if (!_.isFunction(callback)) {
      throw new Error('Curl-Converter: callback is not valid function');
    }

    options = sanitizeOptions(options, self.getOptions());

    var indent, trim, headersData, body, redirect, timeout, multiLine,
      format, snippet, silent, url, quoteType, ntlmAuth;

    redirect = options.followRedirect;
    timeout = options.requestTimeoutInSeconds;
    multiLine = options.multiLine;
    format = options.longFormat;
    trim = options.trimRequestBody;
    silent = options.silent;
    quoteType = options.quoteType === 'single' ? '\'' : '"';
    url = getUrlStringfromUrlObject(request.url, quoteType);
    ntlmAuth = getNtlmAuthInfo(request.auth, quoteType, format);

    snippet = 'curl';

    // NTLM auth first
    if (ntlmAuth) {
      snippet += ntlmAuth;
    }

    // NEW: Basic & Bearer Auth
    snippet = self._addAuth(request, snippet, format, quoteType);

    if (silent) {
      snippet += ` ${form('-s', format)}`;
    }
    if (redirect) {
      snippet += ` ${form('-L', format)}`;
    }
    if (timeout > 0) {
      snippet += ` ${form('-m', format)} ${timeout}`;
    }
    if ((url.match(/[{[}\]]/g) || []).length > 0) {
      snippet += ` ${form('-g', format)}`;
    }

    if (multiLine) {
      indent = options.indentType === 'Tab' ? '\t' : ' ';
      indent = ' ' + options.lineContinuationCharacter + '\n' + indent.repeat(options.indentCount);
    } else {
      indent = ' ';
    }

    if (request.method === 'HEAD') {
      snippet += ` ${form('-I', format)}`;
    }
    if (shouldAddHttpMethod(request, options)) {
      snippet += ` ${form('-X', format)} ${request.method}`;
    }
    snippet += ` ${quoteType + url + quoteType}`;

    // HEADERS
    if (request.body && !request.headers.has('Content-Type')) {
      if (request.body.mode === 'file') {
        request.addHeader({ key: 'Content-Type', value: 'text/plain' });
      } else if (request.body.mode === 'graphql') {
        request.addHeader({ key: 'Content-Type', value: 'application/json' });
      }
    }

    headersData = request.toJSON().header;
    if (headersData) {
      headersData = _.reject(headersData, 'disabled');
      _.forEach(headersData, (header) => {
        if (!header.key) return;
        snippet += indent + `${form('-H', format)} ${quoteType}${sanitize(header.key, true, quoteType)}`;
        if (header.value) {
          snippet += `: ${sanitize(header.value, false, quoteType)}${quoteType}`;
        } else {
          snippet += ';' + quoteType;
        }
      });
    }

    // FORM DATA HANDLING
    if (request.body && request.body.mode === 'formdata') {
      let formdata = request.body.formdata,
        formdataArray = [];
      formdata.members.forEach((param) => {
        let key = param.key,
          type = param.type,
          disabled = param.disabled,
          contentType = param.contentType;
        if (type === 'file') {
          if (typeof param.src !== 'string') {
            if (Array.isArray(param.src) && param.src.length) {
              param.src.forEach((filePath) => {
                addFormParam(formdataArray, key, param.type, filePath, disabled, contentType);
              });
            } else {
              addFormParam(formdataArray, key, param.type, '/path/to/file', disabled, contentType);
            }
          } else {
            addFormParam(formdataArray, key, param.type, param.src, disabled, contentType);
          }
        } else {
          addFormParam(formdataArray, key, param.type, param.value, disabled, contentType);
        }
      });
      request.body.update({
        mode: 'formdata',
        formdata: formdataArray
      });
    }

    // BODY HANDLING
    if (request.body) {
      body = request.body.toJSON();
      if (!_.isEmpty(body)) {
        switch (body.mode) {
          case 'urlencoded':
            _.forEach(body.urlencoded, function (data) {
              if (!data.disabled) {
                snippet += indent + (format ? '--data-urlencode' : '-d');
                snippet += ` ${quoteType}${sanitize(data.key, trim, quoteType, false, true)}=` +
                  `${sanitize(data.value, trim, quoteType, false, !format)}${quoteType}`;
              }
            });
            break;
          case 'raw': {
            let rawBody = body.raw.toString(),
              isAsperandPresent = _.includes(rawBody, '@'),
              optionName = isAsperandPresent ? '--data-raw' : form('-d', format),
              sanitizedBody = sanitize(rawBody, trim, quoteType);

            if (!multiLine) {
              try { sanitizedBody = JSON.stringify(JSON.parse(sanitizedBody)); }
              catch (e) { /* do nothing */ }
            }

            snippet += indent + `${optionName} ${quoteType}${sanitizedBody}${quoteType}`;
            break;
          }
          case 'graphql': {
            let query = body.graphql ? body.graphql.query : '',
              graphqlVariables, requestBody, isAsperandPresent, optionName;
            try { graphqlVariables = JSON.parse(body.graphql.variables); }
            catch (e) { graphqlVariables = {}; }

            requestBody = JSON.stringify({ query: query, variables: graphqlVariables });
            isAsperandPresent = _.includes(requestBody, '@');
            optionName = isAsperandPresent ? '--data-raw' : form('-d', format);
            snippet += indent + `${optionName} ${quoteType}${sanitize(requestBody, trim, quoteType)}${quoteType}`;
            break;
          }
          case 'formdata':
            _.forEach(body.formdata, function (data) {
              if (!(data.disabled)) {
                if (data.type === 'file') {
                  snippet += indent + `${form('-F', format)} ${quoteType}${sanitize(data.key, trim, quoteType)}=` +
                    `${sanitize(`@"${sanitize(data.src, trim, '"', true)}"`, trim, quoteType, quoteType === '"')}${quoteType}`;
                } else {
                  snippet += indent + `${form('-F', format)} ${quoteType}${sanitize(data.key, trim, quoteType)}=` +
                    sanitize(`"${sanitize(data.value, trim, '"', true)}"`, trim, quoteType, quoteType === '"');
                  if (data.contentType) snippet += `;type=${data.contentType}`;
                  snippet += quoteType;
                }
              }
            });
            break;
          case 'file':
            snippet += indent + (format ? '--data-binary' : '-d');
            snippet += ` ${quoteType}@${sanitize(body[body.mode].src, trim)}${quoteType}`;
            break;
          default:
            snippet += `${form('-d', format)} ${quoteType}${quoteType}`;
        }
      }
    }

    callback(null, snippet);
  },

  getOptions: function () {
    return [
      {
        name: 'Generate multiline snippet',
        id: 'multiLine',
        type: 'boolean',
        default: true
      },
      {
        name: 'Use long form options',
        id: 'longFormat',
        type: 'boolean',
        default: true
      },
      {
        name: 'Quote Type',
        id: 'quoteType',
        availableOptions: ['single', 'double'],
        type: 'enum',
        default: 'single'
      },
      {
        name: 'Set request timeout (in seconds)',
        id: 'requestTimeoutInSeconds',
        type: 'positiveInteger',
        default: 0
      },
      {
        name: 'Follow redirects',
        id: 'followRedirect',
        type: 'boolean',
        default: true
      },
      {
        name: 'Trim request body fields',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false
      },
      {
        name: 'Use Silent Mode',
        id: 'silent',
        type: 'boolean',
        default: false
      }
    ];
  }

};
