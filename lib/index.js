var sdk = require('postman-collection'),
  convertMap = [ { type: 'code_generator',
    lang: 'curl',
    variant: 'curl',
    syntax_mode: 'powershell',
    main:
  { convert: require('../codegens/curl/index').convert,
    getOptions: require('../codegens/curl/index').getOptions } },
  { type: 'code_generator',
    lang: 'go',
    variant: 'native',
    syntax_mode: 'go',
    main:
  { convert: require('../codegens/golang/index').convert,
    getOptions: require('../codegens/golang/index').getOptions } },
  { type: 'code_generator',
    lang: 'JavaScript',
    variant: 'Fetch',
    syntax_mode: 'javascript',
    main:
  { convert: require('../codegens/js-fetch/index').convert,
    getOptions: require('../codegens/js-fetch/index').getOptions } },
  { type: 'code_generator',
    lang: 'javascript',
    variant: 'jquery',
    syntax_mode: 'javascript',
    main:
  { convert: require('../codegens/js-jquery/index').convert,
    getOptions: require('../codegens/js-jquery/index').getOptions } },
  { type: 'code_generator',
    lang: 'nodejs',
    variant: 'native',
    syntax_mode: 'javascript',
    main:
  { convert: require('../codegens/nodejs-native/index').convert,
    getOptions: require('../codegens/nodejs-native/index').getOptions } },
  { type: 'code_generator',
    lang: 'php',
    variant: 'curl',
    syntax_mode: 'php',
    main:
  { convert: require('../codegens/php-curl/index').convert,
    getOptions: require('../codegens/php-curl/index').getOptions } },
  { type: 'code_generator',
    lang: 'bash',
    variant: 'powershell - rest method',
    syntax_mode: 'bash',
    main:
  { convert: require('../codegens/powershell-restmethod/index').convert,
    getOptions: require('../codegens/powershell-restmethod/index').getOptions } },
  { type: 'code_generator',
    lang: 'python',
    variant: 'requests',
    syntax_mode: 'python',
    main:
  { convert: require('../codegens/python-requests/index').convert,
    getOptions: require('../codegens/python-requests/index').getOptions } },
  { type: 'code_generator',
    lang: 'Ruby',
    variant: 'net/http',
    main:
  { convert: require('../codegens/ruby/index').convert,
    getOptions: require('../codegens/ruby/index').getOptions } },
  { type: 'code_generator',
    lang: 'swift',
    variant: 'URLSession',
    syntax_mode: 'swift',
    main:
 { convert: require('../codegens/swift/index').convert,
   getOptions: require('../codegens/swift/index').getOptions } } ];

const languageMap = JSON.parse('[{"key":"curl","label":"cURL","variants":[{"key":"curl"}]},{"key":"go","label":"Go","variants":[{"key":"native"}]},{"key":"javascript","label":"JS","variants":[{"key":"fetch"}]},{"key":"javascript","label":"JS","variants":[{"key":"jquery"}]},{"key":"nodejs","label":"NodeJs","variants":[{"key":"native"}]},{"key":"php","label":"PHP","variants":[{"key":"curl"}]},{"key":"bash","label":"bash","variants":[{"key":"powershell - rest method"}]},{"key":"python","label":"Python","variants":[{"key":"requests"}]},{"key":"ruby","label":"Ruby","variants":[{"key":"net/http"}]},{"key":"swift","label":"Swift","variants":[{"key":"urlsession"}]}]'); // eslint-disable-line

module.exports = {
  /**
   * Gets the options specific to a given language.
   *
   * @param {Object} language - language key provided by getLanguageList function
   * @param {Array} variant - variant key provided by getLanguageList function
   * @param {Function} callback - callback function with arguments (error, object)
   */
  getOptions (language, variant, callback) {
    var validCodegen = convertMap.filter((codegen) => {
      var lang = codegen.lang.trim(),
        currentVariant = codegen.variant.trim();
      return language === lang.toLowerCase() && variant === currentVariant.toLowerCase();
    });

    validCodegen.forEach((codegen) => {
      main = codegen.main;
      if (typeof main.getOptions !== 'function') {
        return callback('Codegen~getOptions: getOptions is not a function');
      }
      if (!main.getOptions) {
        return callback('Codegen~convert: Could not find condegen corresponding to provided language, variant pair');
      }

      return callback(null, main.getOptions());
    });
  },

  /**
   * Returns an object of supported languages
   *
   * @param {Function} callback - function with arguments (error, array)
   */
  getLanguageList (callback) {
    return callback(null, languageMap);
  },

  /**
   * Converts a request to a preferred language snippet
   *
   * @param {Object} language - language key provided by getLanguageList function
   * @param {Array} variant - variant key provided by getLanguageList function
   * @param {String} request -  valid postman request
   * @param {Object} [options] - contains convert level options
   * @param {Number} [options.indentType] - indentation based on tab or spaces 
   * @param {Number} [options.indentCount] - count/frequency of indentType
   * @param {Number} [options.requestTimeout] : time in milli-seconds after which request will bail out
   * @param {Boolean} [options.requestBodyTrim] : whether to trim request body fields
   * @param {Boolean} [options.addCacheHeader] : whether to add cache-control header to postman SDK-request
   * @param {Boolean} [options.followRedirect] : whether to allow redirects of a request
   * @param {Function} callback - callback function with arguments (error, string)
   */
  convert (language, variant, request, options, callback) {
    var convert, main;

    if (!sdk.Request.isRequest(request)) {
      return callback('Codegen~convert: Invalid request');
    }

    convertMap.forEach((codegen) => {
      var lang = codegen.lang.trim(),
        currentVariant = codegen.variant.trim();
      if (language === lang.toLowerCase() && variant === currentVariant.toLowerCase()) {
        main = codegen.main;
        convert = main.convert;

        if (typeof convert !== 'function') {
          return callback('Codegen~convert: Convert is not a function');
        }
      }
    });
    if (!convert) {
      return callback('Codegen~convert: Could not find condegen corresponding to provided language, variant pair');
    }


    convert(request, options, function (err, snippet) {
      if (err) {
        return callback(err);
      }

      return callback(null, snippet);
    });
  }
};
