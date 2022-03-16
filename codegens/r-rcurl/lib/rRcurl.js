const getOptions = require('./options').getOptions;

/**
  * Validates if the input is a function
  *
  * @module convert
  *
  * @param  {*} validateFunction - postman SDK-request object
  * @returns {boolean} true if is a function otherwise false
  */
function validateIsFunction (validateFunction) {
  return typeof validateFunction === 'function';
}

/**
  * Used to convert the postman sdk-request object in PHP-Guzzle request snippet
  *
  * @module convert
  *
  * @param  {Object} request - postman SDK-request object
  * @param  {object} options - process options
  * @param  {Function} callback - function with parameters (error, snippet)
  * @returns {String} - returns generated PHP-Guzzle snippet via callback
  */
function convert (request, options, callback) {

  if (!validateIsFunction(callback)) {
    throw new Error('R-Rcurl~convert: Callback is not a function');
  }
  let snippet = 'snippet';

  return callback(null, snippet);
}

module.exports = {
  /**
   * Used in order to get options for generation of R-rCurl code snippet
   *
   * @module getOptions
   *
   * @returns {Array} Options specific to generation of R-rCurl code snippet
   */
  getOptions,

  convert
};
