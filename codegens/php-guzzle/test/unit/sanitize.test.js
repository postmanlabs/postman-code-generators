const expect = require('chai').expect,
  { sanitizeString, sanitizeOptions } = require('../../lib/util/sanitize'),
  { getOptions } = require('../../lib/options');

describe('Sanitize function', function () {
  it('should return empty string when input is not a string type', function () {
    expect(sanitizeString(123, false)).to.equal('');
    expect(sanitizeString(null, false)).to.equal('');
    expect(sanitizeString({}, false)).to.equal('');
    expect(sanitizeString([], false)).to.equal('');
  });

  it('should trim input string when needed', function () {
    expect(sanitizeString('inputString     ', true)).to.equal('inputString');
  });
});

describe('sanitizeOptions function', function () {
  let defaultOptions = {},
    testOptions = {},
    sanitizedOptions;

  getOptions().forEach((option) => {
    defaultOptions[option.id] = {
      default: option.default,
      type: option.type
    };
    if (option.type === 'enum') {
      defaultOptions[option.id].availableOptions = option.availableOptions;
    }
  });

  it('should remove option not supported by module', function () {
    testOptions.randomName = 'random value';
    sanitizedOptions = sanitizeOptions(testOptions, getOptions());
    expect(sanitizedOptions).to.not.have.property('randomName');
  });

  it('should use defaults when option value type does not match with expected type', function () {
    testOptions = {};
    testOptions.indentCount = '5';
    testOptions.trimRequestBody = 'true';
    testOptions.indentType = 'tabSpace';
    sanitizedOptions = sanitizeOptions(testOptions, getOptions());
    expect(sanitizedOptions.indentCount).to.equal(defaultOptions.indentCount.default);
    expect(sanitizedOptions.indentType).to.equal(defaultOptions.indentType.default);
    expect(sanitizedOptions.trimRequestBody).to.equal(defaultOptions.trimRequestBody.default);
  });

  it('should use defaults when option type is valid but value is invalid', function () {
    testOptions = {};
    testOptions.indentCount = -1;
    testOptions.indentType = 'spaceTab';
    testOptions.requestTimeout = -3000;
    sanitizedOptions = sanitizeOptions(testOptions, getOptions());
    expect(sanitizedOptions.indentCount).to.equal(defaultOptions.indentCount.default);
    expect(sanitizedOptions.indentType).to.equal(defaultOptions.indentType.default);
    expect(sanitizedOptions.requestTimeout).to.equal(defaultOptions.requestTimeout.default);
  });

  it('should return the same object when default options are provided', function () {
    for (var id in defaultOptions) {
      if (defaultOptions.hasOwnProperty(id)) {
        testOptions[id] = defaultOptions[id].default;
      }
    }
    sanitizedOptions = sanitizeOptions(testOptions, getOptions());
    expect(sanitizedOptions).to.deep.equal(testOptions);
  });

  it('should return the same object when valid (but not necessarily defaults) options are provided', function () {
    testOptions = {
      indentType: 'Tab',
      indentCount: 3,
      requestTimeout: 3000,
      trimRequestBody: true,
      asyncType: 'async',
      followRedirect: false,
      includeBoilerplate: true
    };
    sanitizedOptions = sanitizeOptions(testOptions, getOptions());
    expect(sanitizedOptions).to.deep.equal(testOptions);
  });
});
