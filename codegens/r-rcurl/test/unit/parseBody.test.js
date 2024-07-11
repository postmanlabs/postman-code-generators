var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),
  {
    parseURLEncodedBody,
    parseBody,
    parseFormData,
    parseRawBody,
    parseGraphQL,
    buildFormDataParamFile
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
    expect(result.bodySnippet).to.equal(expectedBody);
  });

  it('should return empty snippet for emtpy formdata params', function () {
    const indentation = '  ',
      bodyTrim = false,
      expectedBody = '',
      result = parseFormData({ members: []}, indentation, bodyTrim);
    expect(result.bodySnippet).to.equal(expectedBody);
  });

  it('should return form data params file', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[26].request.body.formdata,
      indentation = '  ',
      bodyTrim = false,
      result = parseFormData(body, indentation, bodyTrim);
    expect(result.numberOfFiles).to.equal(1);
    expect(result.fileSnippet).to.equal('file0 = fileUpload(\n  filename = path.expand(\'\'))\n');
  });
});

describe('parseRawBody method', function () {
  it('should return formData json params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[8].request.body.raw,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = '"{\n' +
      '  \\"json\\": \\"Test-Test\\"\n' +
      '}"',
      result = parseRawBody(body, indentation, bodyTrim, 'application/json');
    expect(result).to.equal(expectedBody);
  });
});

describe('parseGraphQL method', function () {
  it('should return graphql json params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[27].request.body.graphql,
      bodyTrim = false,
      expectedBody = '\'{\\"query\\":\\"{\\\\n  findScenes(\\\\n    filter: {per_page: 0}\\\\n   ' +
      ' scene_filter: {is_missing: \\\\\\"performers\\\\\\"}){\\\\n    count\\\\n    scenes' +
      ' {\\\\n      id\\\\n      title\\\\n      path\\\\n    }\\\\n  }\\\\n}\\",\\"variables\\":' +
      '{\\"variable_key\\":\\"variable_value\\"}}\';',
      result = parseGraphQL(body, bodyTrim);
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
    expect(result.bodySnippet).to.equal(expectedBody);
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
      result = parseBody(body, indentation, bodyTrim, 'application/json');
    expect(result).to.equal(expectedBody);
  });

  it('should return raw string params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[6].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'params = "Duis posuere augue vel cursus pharetra. In luctus a ex nec pretium. ' +
      'Praesent neque quam, tincidunt nec leo eget, rutrum vehicula magna.\\nMaecenas consequat elementum elit,' +
      ' id semper sem tristique et. Integer pulvinar enim quis consectetur interdum volutpat."\n',
      result = parseBody(body, indentation, bodyTrim);
    expect(result).to.equal(expectedBody);
  });

  it('should return graphql params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[27].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'params = \'{\\"query\\":\\"{\\\\n  findScenes(\\\\n    filter: {per_page: 0}\\\\n   ' +
      ' scene_filter: {is_missing: \\\\\\"performers\\\\\\"}){\\\\n    count\\\\n    scenes' +
      ' {\\\\n      id\\\\n      title\\\\n      path\\\\n    }\\\\n  }\\\\n}\\",\\"variables\\":' +
      '{\\"variable_key\\":\\"variable_value\\"}}\';\n',
      result = parseBody(body, indentation, bodyTrim, 'graphql');
    expect(result).to.equal(expectedBody);

  });
});

describe('buildFormDataParamFile method', function () {
  it('should return a snippet for file var creation"', function () {
    const expected = 'file0 = fileUpload(\n' +
      '  filename = path.expand(\'/Users/name/dummyFile1.txt\'))\n',
      res = buildFormDataParamFile({ src: '/Users/name/dummyFile1.txt'}, '  ', true, 0);
    expect(expected).to.equal(res);
  });

  it('should return a snippet for file var creation index 1"', function () {
    const expected = 'file1 = fileUpload(\n' +
      '  filename = path.expand(\'/Users/name/dummyFile1.txt\'))\n',
      res = buildFormDataParamFile({ src: '/Users/name/dummyFile1.txt'}, '  ', true, 1);
    expect(expected).to.equal(res);
  });
});
