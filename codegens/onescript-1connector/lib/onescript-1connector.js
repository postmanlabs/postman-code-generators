var _ = require('./lodash'),
  parseBody = require('./util/parseBody'),
  sanitize = require('./util/sanitize').sanitize,
  sanitizeOptions = require('./util/sanitize').sanitizeOptions,
  addFormParam = require('./util/sanitize').addFormParam,
  self;

/**
 * Used to parse the request headers
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @returns {String} - request headers in the desired format
 */

 function getheaders (request) {
  var headerArray = request.toJSON().header,
    headerMap;

  var headers_str = 'Заголовки = Новый Соответствие;\n';

  if (!_.isEmpty(headerArray)) {
    headerArray = _.reject(headerArray, 'disabled');
    headerMap = _.map(headerArray, function (header) {
      return `Заголовки.Вставить(` 
        + `"${sanitize(header.key, 'header', true)}", ` 
        + `"${sanitize(header.value, 'header')}");`;
    });
    headers_str += headerMap.join(',\n');
  }
  headers_str += '\n';

  headers_str += 'ДополнительныеПараметры.Вставить("Заголовки", Заголовки);\n';
  return headers_str;
}

self = module.exports = {
  /**
     * Used to return options which are specific to a particular plugin
     *
     * @returns {Array}
     */
  getOptions: function () {
    return [
      {
        name: 'Set request timeout',
        id: 'requestTimeout',
        type: 'positiveInteger',
        default: 0,
        description: 'Set number of milliseconds the request should wait for a response' +
      ' before timing out (use 0 for infinity)'
      },
      {
        name: 'Follow redirects',
        id: 'followRedirect',
        type: 'boolean',
        default: true,
        description: 'Automatically follow HTTP redirects'
      },
      {
        name: 'Trim request body fields',
        id: 'trimRequestBody',
        type: 'boolean',
        default: false,
        description: 'Remove white space and additional lines that may affect the server\'s response'
      },
    ];
  },
  
  /**
    * Used to convert the postman sdk-request object to python request snippet
    *
    * @param  {Object} request - postman SDK-request object
    * @param  {Object} options
    * @param  {Number} options.requestTimeout : time in milli-seconds after which request will bail out
                                                (default: 0 -> never bail out)
    * @param  {Boolean} options.trimRequestBody : whether to trim request body fields (default: false)
    * @param  {Boolean} options.followRedirect : whether to allow redirects of a request
    * @param  {Function} callback - function with parameters (error, snippet)
    */
  convert: function (request, options, callback) {
    var snippet = '',
        indentation = '',
        identity = '',
        contentType;

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    else if (!_.isFunction(callback)) {
      throw new Error('OneScript-1CConnector~convert: Callback is not a function');
    }
    options = sanitizeOptions(options, self.getOptions());
  
    indentation = '\t';
    contentType = request.headers.get('Content-Type');
    snippet += '#Использовать 1connector\n\n';
    snippet += 'ДополнительныеПараметры = Новый Структура;\n';

    if (options.requestTimeout > 0) {
      snippet += 'ДополнительныеПараметры.Вставить("Таймаут", ' + options.requestTimeout + ');\n';
    }
  
    if (!options.followRedirect) {
      snippet += 'ДополнительныеПараметры.Вставить("РазрешитьПеренаправление", Ложь);\n';
    }

    snippet += '\n';
    snippet += `URL = "${sanitize(request.url.toString(), 'url')}";\n\n`;

    // The following code handles multiple files in the same formdata param.
    // It removes the form data params where the src property is an array of filepath strings
    // Splits that array into different form data params with src set as a single filepath string
    
    if (request.body && request.body.mode === 'formdata') {

      let formdata = request.body.formdata,
        formdataArray = [];
      formdata.members.forEach((param) => {
        let key = param.key,
          type = param.type,
          disabled = param.disabled,
          contentType = param.contentType;
        // check if type is file or text
        if (type === 'file') {
          // if src is not of type string we check for array(multiple files)
          if (typeof param.src !== 'string') {
            // if src is an array(not empty), iterate over it and add files as separate form fields
            if (Array.isArray(param.src) && param.src.length) {
              param.src.forEach((filePath) => {
                addFormParam(formdataArray, key, param.type, filePath, disabled, contentType);
              });
            }
            // if src is not an array or string, or is an empty array, add a placeholder for file path(no files case)
            else {
              addFormParam(formdataArray, key, param.type, '/path/to/file', disabled, contentType);
            }
          }
          // if src is string, directly add the param with src as filepath
          else {
            addFormParam(formdataArray, key, param.type, param.src, disabled, contentType);
          }
        }
        // if type is text, directly add it to formdata array
        else {
          addFormParam(formdataArray, key, param.type, param.value, disabled, contentType);
        }
      });
      request.body.update({
        mode: 'formdata',
        formdata: formdataArray
      });
    }
  
    snippet += `${parseBody(request.toJSON(), indentation, options.trimRequestBody, contentType)}\n`;
    if (request.body && !contentType) {
      if (request.body.mode === 'file') {
        request.addHeader({
          key: 'Content-Type',
          value: 'text/plain'
        });
      }
      else if (request.body.mode === 'graphql') {
        request.addHeader({
          key: 'Content-Type',
          value: 'application/json'
        });
      }
    }
    snippet += `${getheaders(request)}\n`;
    snippet += `Ответ = КоннекторHTTP.ВызватьМетод("${request.method}", URL, ДополнительныеПараметры);\n\n`;

    snippet += 'Сообщить(Ответ.Текст());\n';

    callback(null, snippet);

  }
}