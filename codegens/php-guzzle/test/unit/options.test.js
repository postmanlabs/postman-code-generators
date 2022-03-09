var expect = require('chai').expect,
  getOptions = require('../../index').getOptions;

describe('getOptions function', function () {
  it('should return array of options for PHP-Guzzle converter', function () {
    expect(getOptions()).to.be.an('array');
  });

  it('should return all the valid options', function () {
    expect(getOptions()[0]).to.have.property('id', 'indentCount');
    expect(getOptions()[1]).to.have.property('id', 'indentType');
    expect(getOptions()[2]).to.have.property('id', 'trimRequestBody');
  });
});
