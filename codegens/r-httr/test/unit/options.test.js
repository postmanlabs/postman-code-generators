var expect = require('chai').expect,
  getOptions = require('../../index').getOptions,
  availableOptions = [{
    0: 'indentCount'
  },
  {
    1: 'indentType'
  },
  {
    2: 'trimRequestBody'
  },
  {
    3: 'requestTimeout'
  }
  ];

describe('getOptions function', function () {
  it('should return array of options for R-HTTR converter', function () {
    expect(getOptions()).to.be.an('array');
  });

  it('should return all the valid options', function () {
    let options = getOptions();
    availableOptions.forEach((availableOption, index) => {
      expect(options[index]).to.have.property('id', availableOption[index]);
    });
  });
});
