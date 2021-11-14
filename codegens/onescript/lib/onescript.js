var _ = require('./lodash'),

  parseRequest = require('./parseRequest'),
  sanitize = require('./util').sanitize,
  addFormParam = require('./util').addFormParam,
  sanitizeOptions = require('./util').sanitizeOptions;

/**
 * returns snippet of java okhttp by parsing data from Postman-SDK request object
 *
 * @param {Object} request - Postman SDK request object
 * @param {String} indentString - indentation required for code snippet
 * @param {Object} options - Options to tweak code snippet
 * @returns {String} - java okhttp code snippet for given request object
 */
 function makeSnippet (request, indentString, options) {
  
  const METHODS_WITHOUT_BODY = ['HEAD', 'COPY', 'UNLOCK', 'UNLINK', 'PURGE', 'LINK', 'VIEW'];
  
  var isBodyRequired = !(_.includes(METHODS_WITHOUT_BODY, request.method)),
  snippet = '',
  requestBody

  snippet += `#Использовать 1connector\n`;
  snippet += `ДополнительныеПараметры = Новый Структура;\n`;

  if (options.requestTimeout > 0) {
    snippet += 'ДополнительныеПараметры.Вставить("Таймаут",' + options.requestTimeout + ');\n';
  }

  if (!options.followRedirect) {
    snippet += 'ДополнительныеПараметры.Вставить("РазрешитьПеренаправление", Ложь);\n';
  }

  snippet += `ДополнительныеПараметры.Вставить("Данные", );
  ДополнительныеПараметры.Вставить("ПараметрыЗапроса", );\n`;
  
  
  snippet += `Заголовки = Новый Структура;
  ДополнительныеПараметры.Вставить("Заголовки", Заголовки);\n`;

  snippet += `Ответ = КоннекторHTTP.ВызватьМетод("${request.method}", "${sanitize(request.url.toString())}", ДополнительныеПараметры);\n`;
  snippet += '// Сообщить(Ответ.Текст());';

  return snippet;

 }

/**
 * Used in order to get options for generation of Java okhattp code snippet (i.e. Include Boilerplate code)
 *
 * @module getOptions
 *
 * @returns {Array} Options specific to generation of Java okhattp code snippet
 */
 function getOptions () {
  return [
    {
      name: 'Set indentation count',
      id: 'indentCount',
      type: 'positiveInteger',
      default: 2,
      description: 'Set the number of indentation characters to add per code level'
    },
    {
      name: 'Set request timeout',
      id: 'requestTimeout',
      type: 'positiveInteger',
      default: 0,
      description: 'Set number of milliseconds the request should wait for a response ' +
        'before timing out (use 0 for infinity)'
    },
  ];
}

/**
 * Converts Postman sdk request object to java okhttp code snippet
 *
 * @module convert
 *
 * @param {Object} request - postman-SDK request object
 * @param {Object} options - Options to tweak code snippet generated in Java-OkHttp
 * @param {String} options.indentType - type for indentation eg: Space, Tab
 * @param {String} options.indentCount - number of spaces or tabs for indentation.
 * @param {Boolean} [options.includeBoilerplate] - indicates whether to include class definition in java
 * @param {Boolean} options.followRedirect - whether to enable followredirect
 * @param {Boolean} options.trimRequestBody - whether to trim fields in request body or not
 * @param {Number} options.requestTimeout : time in milli-seconds after which request will bail out
 * @param {Function} callback - callback function with parameters (error, snippet)
 */
 function convert (request, options, callback) {

  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  else if (!_.isFunction(callback)) {
    throw new Error('Java-OkHttp-Converter: callback is not valid function');
  }
  options = sanitizeOptions(options, getOptions());
  //  String representing value of indentation required

  //  String representing value of indentation required
  var indentString,
    //  snippet to create request in java okhttp
    snippet = '';

    indentString = ' ';
    indentString = indentString.repeat(options.indentCount);

    snippet = makeSnippet(request, indentString, options);

    return callback(null, snippet );

}
module.exports = {
  convert: convert,
  getOptions: getOptions
};