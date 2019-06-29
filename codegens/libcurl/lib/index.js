var sanitize = require('./util').sanitize,
  _ = require('./lodash');

module.exports = {
  convert: function (request, options, callback) {

    if (!_.isFunction(callback)) {
      throw new Error('Curl-Converter: callback is not valid function');
    }

    var indent = '',
      trim, headersData, body, text,
      multiLine,
      snippet,
      newline = ' ',
      formCheck,
      formdataString = '',
      protocol,
      BOUNDARY = '----WebKitFormBoundary7MA4YWxkTrZu0gW',
      responseCode;

    multiLine = options.multiLine || _.isUndefined(options.multiLine);
    trim = options.trimRequestBody ? options.trimRequestBody : false;
    protocol = options.protocol ? options.protocol : 'https';

    if (multiLine) {
      newline = '\n';
      indent = options.indentType === 'tab' ? '\t' : ' ';
      indent = newline + indent.repeat(options.indentCount);
    }
    snippet = '#include <stdio.h>' + newline + '#include <string.h>' + newline +
    '#include <curl/curl.h>' + newline + 'int main(int argc, char *argv[]){\n';
    snippet += 'CURL *curl;';
    snippet += newline + 'CURLcode res;';
    snippet += newline + 'curl = curl_easy_init();';
    snippet += newline + 'if(curl) {';
    snippet += indent + `curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${request.method}");`;
    snippet += indent + `curl_easy_setopt(curl, CURLOPT_URL, "${encodeURI(request.url.toString())}");`;
    snippet += indent + `curl_easy_setopt(curl, CURLOPT_DEFAULT_PROTOCOL, "${protocol}");`;
    snippet += indent + 'struct curl_slist *headers = NULL;';
    headersData = request.getHeaders({ enabled: true });
    _.forEach(headersData, function (value, key) {
      snippet += indent + `headers = curl_slist_append(headers, "${key}: ${value}");`;
    });
    body = request.body.toJSON();
    if (body.mode && body.mode === 'formdata' && !options.useMimeType) {
      snippet += indent + 'headers = curl_slist_append(headers, "content-type:' +
                ` multipart/form-data; boundary=${BOUNDARY}");`;
    }
    snippet += indent + 'curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);';
    //request body
    if (request.method === 'HEAD') {
      snippet += indent + 'curl_easy_setopt(curl, CURLOPT_NOBODY, 1L);';
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
          snippet += indent + `const char *data = "${text.join('&')}";`;
          snippet += indent + 'curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);';
          break;
        case 'raw':
          snippet += indent + `const char *data = "${sanitize(body.raw.toString(), trim)}";`;
          snippet += indent + 'curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);';
          break;
        case 'formdata':
          if (options.useMimeType) {
            snippet += indent + 'curl_mime *mime;';
            snippet += indent + 'curl_mimepart *part;';
            snippet += indent + 'mime = curl_mime_init(curl);';
            snippet += indent + 'part = curl_mime_addpart(mime);';
            formCheck = false;

            _.forEach(body.formdata, function (data) {
              if (!(data.disabled)) {
                if (formCheck) {
                  snippet += indent + 'part = curl_mime_addpart(mime);';
                }
                else {
                  formCheck = true;
                }
                if (data.type === 'file') {
                  snippet += indent + `curl_mime_name(part, "${sanitize(data.key, trim)}");`;
                  snippet += indent + `curl_mime_filedata(part, "${sanitize(data.src, trim)}");`;
                }
                else {
                  snippet += indent + `curl_mime_name(part, "${sanitize(data.key, trim)}");`;
                  snippet += indent + `curl_mime_data(part, "${sanitize(data.value, trim)}", CURL_ZERO_TERMINATED);`;
                }
              }
            });
            snippet += indent + 'curl_easy_setopt(curl, CURLOPT_MIMEPOST, mime);';
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
            snippet += indent + `curl_easy_setopt(curl, CURLOPT_POSTFIELDS, "${formdataString}");`;
          }
          break;
        case 'file':
          snippet += indent + `const char *data = "${sanitize(body.key, trim)}=@${sanitize(body.value, trim)}";`;
          snippet += indent + 'curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data);';
          break;
        default:
          snippet = String(snippet);
      }
    }

    snippet += indent + 'res = curl_easy_perform(curl);';
    responseCode = ['if(res == CURLE_OK) {', 'long response_code;',
      'curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);',
      'if(!res && response_code) printf("%03ld", response_code);', '}'];

    snippet += indent + responseCode.join(indent);
    if (body.mode === 'formdata' && options.useMimeType) {
      snippet += indent + 'curl_mime_free(mime);';
    }
    snippet += newline + '}';
    snippet += newline + 'curl_easy_cleanup(curl);' + newline + 'return (int)res;' + newline + '}';
    callback(null, snippet);
  },
  getOptions: function () {
    return [
      {
          name: 'Multiline snippet',
          id: 'multiLine',
          type: 'boolean',
          default: true,
          description: 'Split code across multiple lines'
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
          type: 'integer',
          default: 2,
          description: 'Number of indentation characters to add per code level'
      },
      {
          name: 'Indent type',
          id: 'indentType',
          type: 'enum',
          availableOptions: ['tab', 'space'],
          default: 'space',
          description: 'Character used for indentation'
      },
      {
          name: 'Body trim',
          id: 'trimRequestBody',
          type: 'boolean',
          default: true,
          description: 'Trim request body fields'
      },
      {
          name: 'Use Mime Format',
          id: 'useMimeType',
          type: 'boolean',
          default: true,
          description: 'Use curl_mime to send multipart/form-data requests'
      }
    ];
  }
};
