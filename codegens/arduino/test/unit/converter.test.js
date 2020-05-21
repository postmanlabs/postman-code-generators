let { convert, getOptions } = require('../../index'),
  { expect } = require('chai'),
  Request = require('postman-collection').Request;

describe('convert()', () => {
  it.only('should generate an output', () => {

    const request = new Request({
      description: 'This is a sample POST request',
      url: 'https://echo.getpostman.com/post',
      method: 'POST',
      header: [
        {
          key: 'Content-Type',
          value: 'application/json'
        }
      ],
      body: {
        mode: 'urlencoded',
        urlencoded: [
          {
            key: 'my-body-variable',
            value: 'Something Awesome!'
          }
        ]
      }
    });

    convert(request, {}, function (error, snippet) {
      if (error) {
        expect.fail('error object should be falsy');
      }
      expect(snippet).to.be.a('string');
    });
  });
});

describe('getOptions()', () => {
  it('should return an empty array', () => {
    const options = getOptions();
    expect(options).to.be.an('array');
    expect(options.length).to.equal(2);
  });
});
