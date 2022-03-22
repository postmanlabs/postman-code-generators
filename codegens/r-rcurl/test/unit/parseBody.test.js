var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),
  {
    parseURLEncodedBody,
    parseBody,
    parseFormData,
    parseRawBody
  } = require('../../lib/util/parseBody'),
  collectionsPath = './fixtures';

describe('parseURLEncodedBody method', function () {
  it('should return form-url-encoded params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[7].request.body.urlencoded,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'c(\n' +
        '  "1" = "\'a\'",\n' +
        '  "2" = "\\"b\\"",\n' +
        '  "\'3\'" = "c",\n' +
        '  "\\"4\\"      " = "d      ",\n' +
        '  "Special" = "!@#$%&*()^_=`~",\n' +
        '  "more" = ",./\';[]}{\\":?><|\\\\\\\\"\n' +
        ')',
      result = parseURLEncodedBody(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });
  it('should return empty snippet for emtpy form-url-encoded params', function () {
    const indentation = '  ',
      bodyTrim = false,
      expectedBody = '',
      result = parseURLEncodedBody({ members: []}, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });
});

describe('parseFormData method', function () {
  it('should return form data params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[4].request.body.formdata,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'c(\n' +
        '  "pl" = "\'a\'",\n' +
        '  "qu" = "\\"b\\"",\n' +
        '  "hdjkljh    " = "c    ",\n' +
        '  "sa" = "d",\n' +
        '  "Special    " = "!@#$%&*()^_+=`~    ",\n' +
        '  "more" = ",./\';[]}{\\":?><|\\\\\\\\"\n' +
        ')',
      result = parseFormData(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });

  it('should return empty snippet for emtpy formdata params', function () {
    const indentation = '  ',
      bodyTrim = false,
      expectedBody = '',
      result = parseFormData({ members: []}, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });
});

describe('parseFormData method', function () {
  it('should return raw json params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[8].request.body.raw,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = '"{\n' +
      '  \\"json\\": \\"Test-Test\\"\n' +
      '}"',
      result = parseRawBody(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });

});


describe('parseBody method', function () {
  it('should return form-url-encoded params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[7].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'params = c(\n' +
        '  "1" = "\'a\'",\n' +
        '  "2" = "\\"b\\"",\n' +
        '  "\'3\'" = "c",\n' +
        '  "\\"4\\"      " = "d      ",\n' +
        '  "Special" = "!@#$%&*()^_=`~",\n' +
        '  "more" = ",./\';[]}{\\":?><|\\\\\\\\"\n' +
        ')\n',
      result = parseBody(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });

  it('should return form data params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[4].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'params = c(\n' +
        '  "pl" = "\'a\'",\n' +
        '  "qu" = "\\"b\\"",\n' +
        '  "hdjkljh    " = "c    ",\n' +
        '  "sa" = "d",\n' +
        '  "Special    " = "!@#$%&*()^_+=`~    ",\n' +
        '  "more" = ",./\';[]}{\\":?><|\\\\\\\\"\n' +
        ')\n',
      result = parseBody(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });

  it('should return raw json params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[8].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'params = "{\n' +
      '  \\"json\\": \\"Test-Test\\"\n' +
      '}"\n',
      result = parseBody(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });
});
