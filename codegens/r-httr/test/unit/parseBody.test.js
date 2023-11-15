var expect = require('chai').expect,
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path'),
  {
    parseBody
  } = require('../../lib/util/parseBody'),
  collectionsPath = './fixtures';

describe('parseBody function', function () {

  it('should parse a raw json Body', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[8].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'body = \'{\n  "json": "Test-Test"\n}\';\n\n';
    let bodySnippet = parseBody(body, indentation, bodyTrim, 'application/json');
    expect(bodySnippet).to.equal(expectedBody);
  });

  it('should parse a raw json Body with indentation', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[8].request.body,
      indentation = '   ',
      bodyTrim = false,
      expectedBody = 'body = \'{\n   "json": "Test-Test"\n}\';\n\n';
    let bodySnippet = parseBody(body, indentation, bodyTrim, 'application/json');
    expect(bodySnippet).to.equal(expectedBody);
  });

  it('should parse a raw xml Body', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[10].request.body,
      indentation = '   ',
      bodyTrim = false,
      expectedBody = 'body = "<xml>\n\tTest Test\n</xml>"\n\n';
    let bodySnippet = parseBody(body, indentation, bodyTrim, 'application/json');
    expect(bodySnippet).to.equal(expectedBody);
  });

  it('should return form-url-encoded params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[7].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'body = list(\n' +
      '  \'\\\'3\\\'\' = \'c\',\n' +
      '  \'"4"      \' = \'d      \',\n' +
      '  \'Special\' = \'!@#$%&*()^_=`~\',\n' +
      '  \'more\' = \',./\\\';[]}{":?><|\\\\\\\\\'\n' +
      ')\n\n',
      result = parseBody(body, indentation, bodyTrim, 'application/x-www-form-urlencoded');
    expect(result).to.equal(expectedBody);

  });

  it('should return form-data params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[4].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'body = list(\n' +
      '  \'pl\' = \'\\\'a\\\'\',\n' +
      '  \'qu\' = \'"b"\',\n' +
      '  \'hdjkljh    \' = \'c    \',\n' +
      '  \'sa\' = \'d\',\n' +
      '  \'Special    \' = \'!@#$%&*()^_+=`~    \',\n' +
      '  \'more\' = \',./\\\';[]}{":?><|\\\\\\\\\'\n' +
      ')\n\n',
      result = parseBody(body, indentation, bodyTrim, 'formdata');
    expect(result).to.equal(expectedBody);

  });

  it('should return form-data params with a file', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[26].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'body = list(\n' +
      '  \'test-file\' = upload_file(\'/path/to/file\')\n' +
      ')\n\n',
      result = parseBody(body, indentation, bodyTrim, 'formdata');
    expect(result).to.equal(expectedBody);

  });

  it('should return binary data params with a file', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[25].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'body = upload_file(\'<file contents here>\')\n\n',
      result = parseBody(body, indentation, bodyTrim, 'formdata');
    expect(result).to.equal(expectedBody);

  });

  it('should return graphql params', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[27].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = 'body = \'{"query":"{\\\\n  findScenes(\\\\n    filter: {per_page: 0}\\\\n   ' +
      ' scene_filter: {is_missing: \\\\"performers\\\\"}){\\\\n    count\\\\n    scenes' +
      ' {\\\\n      id\\\\n      title\\\\n      path\\\\n    }\\\\n  }\\\\n}","variables":' +
      '{"variable_key":"variable_value"}}\'\n\n',
      result = parseBody(body, indentation, bodyTrim, 'graphql');
    expect(result).to.equal(expectedBody);

  });

  it('should return empty form data', function () {
    const collection = new sdk.Collection(JSON.parse(
        fs.readFileSync(path.resolve(__dirname, collectionsPath, './sample_collection.json').toString()))),
      body = collection.items.members[28].request.body,
      indentation = '  ',
      bodyTrim = false,
      expectedBody = '',
      result = parseBody(body, indentation, bodyTrim, 'graphql');
    expect(result).to.equal(expectedBody);

  });
});
