let { convert, getOptions } = require('../../index'),
  { expect } = require('chai'),
  Request = require('postman-collection').Request;

describe('convert', () => {
  it('should generate an output', () => {
    const request = new Request({
      url: 'http://example.com',
      method: 'GET'
    });
    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail('error object should be falsy');
      }
      expect(snippet).to.be.a('string');
    });
  });
});

describe('getOptions', () => {
  it('should return an empty array', () => {
    const options = getOptions();
    expect(options).to.be.an('array');
    expect(options.length).to.equal(0);
  });
});
