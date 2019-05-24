var fs = require('fs'),
  path = require('path'),
  sdk = require('postman-collection'),
  labelList = require('./util/languageLabels');
const PATH_TO_CODEGENS_FOLDER = path.resolve(__dirname, '../codegens');

/** Returns a list of codegens available.
 *
 * @param {Function} callback
 * @returns {Array}
 */
function getCodegenList (callback) {
  var codegens,
    codegenList = [],
    isDirectory = (source) => {
      return fs.lstatSync(source).isDirectory();
    },
    readFile = (source) => {
      return fs.readFileSync(source);
    };

  // Try to get all the codegens directories from the path provided.
  // Catch error if any and return
  try {
    codegens = fs.readdirSync(PATH_TO_CODEGENS_FOLDER).map((name) => {
      return `${PATH_TO_CODEGENS_FOLDER}/${name}`;
    }).filter(isDirectory);
  }
  catch (e) {
    return callback('Error in getting list of codegens' + e);
  }

  if (codegens.length === 0) {
    return callback('No codegens found.');
  }

  codegens.forEach((codegen) => {
    const content = readFile(`${codegen}/package.json`).toString(),
      json = JSON.parse(content);
    json.com_postman_plugin.main = require(`${codegen}/${json.main}`);
    codegenList.push(json.com_postman_plugin);
  });

  return callback(null, codegenList);
}

module.exports = {
  /**
   * Gets the options specific to a given language.
   *
   * @param {Object} language - language key provided by getLanguageList function
   * @param {Array} variant - variant key provided by getLanguageList function
   * @param {Function} callback - callback function with arguments (error, object)
   */
  getOptions (language, variant, callback) {
    getCodegenList((error, codegenList) => {
      if (error) {
        return callback(error);
      }

      var validCodegen = codegenList.filter((codegen) => {
        var lang = codegen.lang.trim(),
          currentVariant = codegen.variant.trim();
        return lang === language.toLowerCase() && variant === currentVariant.toLowerCase();
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
    });
  },

  /**
   * Returns an object of supported languages
   *
   * @param {Function} callback - function with arguments (error, array)
   */
  getLanguageList (callback) {
    var langMap = {},
      languageList = [];

    getCodegenList((error, codegenList) => {
      if (error) {
        return callback(error);
      }

      codegenList.forEach((codegen) => {
        var lang = codegen.lang.trim(),
          variant = codegen.variant.trim();
        if (!langMap[lang.toLowerCase()]) {
          langMap[codegen.lang] = {
            key: lang.toLowerCase(),
            label: labelList[lang.toLowerCase()] ? labelList[lang.toLowerCase()] : lang.toLowerCase(),
            variants: [
              {
                key: variant.toLowerCase()
              }
            ]
          };
        }
        else {
          langMap.codegen.lang.variants.push({
            label: codegen.variant.trim(),
            key: codegen.variant.trim()
          });
        }
      });

      languageList = Object.keys(langMap).map(function (lang) {
        return langMap[lang];
      });

      return callback(null, languageList);
    });
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

    getCodegenList((error, codegenList) => {
      if (error) {
        return callback(error);
      }
      codegenList.forEach((codegen) => {
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
    });

  }
};
