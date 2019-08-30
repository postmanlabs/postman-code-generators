var sanitize = require('./util').sanitize,
  sanitizeOptions = require('./util').sanitizeOptions,
  _ = require('./lodash'),
  self;

self = module.exports = {
  convert: function (request, options, callback) {

    if (!_.isFunction(callback)) {
      throw new Error('Curl-Converter: callback is not valid function');
    }
    options = sanitizeOptions(options, self.getOptions());

    var trim, headersData, body, text,
      snippet = '',
      formCheck,
      formdataString = '',
      protocol,
      BOUNDARY = '----WebKitFormBoundary7MA4YWxkTrZu0gW',
      timeout,
      indent = options.indentType === 'Tab' ? '\t' : ' ',
      indentString = indent.repeat(options.indentCount),
      headerSnippet = '',
      footerSnippet = '';
    if (options.includeBoilerplate) {
      headerSnippet = '#include <stdio.h>\n#include <string.h>\n#include <curl/curl.h>\n' +
      'int main(int argc, char *argv[]){\n';
      footerSnippet = 'return (int)res;\n}';
    }
    trim = options.trimRequestBody;
    protocol = options.protocol;
    timeout = options.requestTimeout;
    snippet += 'CURL *curl;\n';
    snippet += 'CURLcode res;\n';
    snippet += 'curl = curl_easy_init();\n';
    snippet += 'if(curl) {\n';
    snippet += indentString + `curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${request.method}");\n`;
    snippet += indentString +
    `curl_easy_setopt(curl, CURLOPT_URL, "${encodeURI(request.url.toString())}");\n`;
    if (timeout) {
      snippet += indentString + `curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, ${timeout}L);\n`;
    }
    snippet += indentString + `curl_easy_setopt(curl, CURLOPT_DEFAULT_PROTOCOL, "${protocol}");\n`;
    snippet += indentString + 'struct curl_slist *headers = NULL;\n';
    headersData = request.getHeaders({ enabled: true });
    _.forEach(headersData, function (value, key) {
      snippet += indentString + `headers = curl_slist_append(headers, "${sanitize(key)}: ${sanitize(value)}");\n`;
    });
    body = request.body.toJSON();
    if (body.mode && body.mode === 'formdata' && !options.useMimeType) {
      snippet += indentString + 'headers = curl_slist_append(headers, "content-type:' +
                ` multipart/form-data; boundary=${BOUNDARY}");\n`;
    }
    snippet += indentString + 'curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);\n';
    // request body
    if (request.method === 'HEAD') {
      snippet += indentString + 'curl_easy_setopt(curl, CURLOPT_NOBODY, 1L);\n';
    }
    if (!_.isEmpty(body)) {
      switch (body.mode) {
        case 'urlencoded':
          text = [];
          _.forEach(body.urlencoded, function (data) {
            if (!data.disabled) {
              text.push(`${escape(data.key)}=${escape(data.value)}`);
            }
          });
          snippet += indentString + `const char *data = "${text.join('&')}";\n`;
          snippet += indentString + 'curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);\n';
          break;
        case 'raw':
          snippet += indentString + `const char *data = "${sanitize(body.raw.toString(), trim)}";\n`;
          snippet += indentString + 'curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);\n';
          break;
        case 'formdata':
          if (options.useMimeType) {
            snippet += indentString + 'curl_mime *mime;\n';
            snippet += indentString + 'curl_mimepart *part;\n';
            snippet += indentString + 'mime = curl_mime_init(curl);\n';
            snippet += indentString + 'part = curl_mime_addpart(mime);\n';
            formCheck = false;

            _.forEach(body.formdata, function (data) {
              if (!(data.disabled)) {
                if (formCheck) {
                  snippet += indentString + 'part = curl_mime_addpart(mime);\n';
                }
                else {
                  formCheck = true;
                }
                if (data.type === 'file') {
                  snippet += indentString + `curl_mime_name(part, "${sanitize(data.key, trim)}");\n`;
                  snippet += indentString + `curl_mime_filedata(part, "${sanitize(data.src, trim)}");\n`;
                }
                else {
                  snippet += indentString + `curl_mime_name(part, "${sanitize(data.key, trim)}");\n`;
                  snippet += indentString +
                  `curl_mime_data(part, "${sanitize(data.value, trim)}", CURL_ZERO_TERMINATED);\n`;
                }
              }
            });
            snippet += indentString + 'curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);\n';
          }
          else {
            BOUNDARY = '--' + BOUNDARY;
            _.forEach(body.formdata, function (data) {
              if (!data.disabled) {
                formdataString += BOUNDARY + '\\r\\nContent-Disposition: form-data; name=' +
                 `\\"${sanitize(data.key)}\\"\\r\\n\\r\\n${sanitize(data.value)}\\r\\n`;
              }
            });
            formdataString += BOUNDARY + '--';
            snippet += indentString + `curl_easy_setopt(curl, CURLOPT_POSTFIELDS, "${formdataString}");\n`;
          }
          break;
        case 'file':
          snippet += indentString +
          `const char *data = "${sanitize(body.key, trim)}=@${sanitize(body.value, trim)}";\n`;
          snippet += indentString + 'curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);\n';
          break;
        default:
          snippet = String(snippet);
      }
    }

    snippet += indentString + 'res = curl_easy_perform(curl);\n';
    if (body.mode === 'formdata' && options.useMimeType) {
      snippet += indentString + 'curl_mime_free(mime);\n';
    }
    snippet += '}\n';
    snippet += 'curl_easy_cleanup(curl);\n';
    (options.includeBoilerplate) &&
    (snippet = indentString + snippet.split('\n').join('\n' + indentString));
    callback(null, headerSnippet + snippet + footerSnippet);
  },
  getOptions: function () {
    return [
      {
        name: 'Include boilerplate',
        id: 'includeBoilerplate',
        type: 'boolean',
        default: false,
        description: 'Include class definition and import statements in snippet'
      },
      {
        name: 'Protocol',
        id: 'protocol',
        type: 'enum',
        availableOptions: ['http', 'https'],
        default: 'https',
        description: 'The protocol to be used to make the request'
      },
      {
        name: 'Indent count',
        id: 'indentCount',
        type: 'positiveInteger',
        default: 2,
        description: 'Number of indentation characters to add per code level'
      },
      {
        name: 'Indent type',
        id: 'indentType',
        type: 'enum',
        availableOptions: ['Tab', 'Space'],
        default: 'Space',
        description: 'Character used for indentation'
      },
      {
        name: 'Body trim',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Trim request body fields'
      },
      {
        name: 'Use curl_mime',
        id: 'useMimeType',
        type: 'boolean',
        default: true,
        description: 'Use curl_mime to send multipart/form-data requests'
      },
      {
        name: 'Request timeout',
        id: 'requestTimeout',
        type: 'positiveInteger',
        default: 0,
        description: 'How long the request should wait for a response before timing out (milliseconds)'
      }
    ];
  }
};
