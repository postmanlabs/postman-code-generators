const { getClientHttpSnippet, getHost, getPort } = require('../../lib/util'),
  { expect } = require('chai');

describe('getClientHttpSnippet()', () => {
  it('should generate a correct output', () => {
    expectedSnippet = '';
    expectedSnippet += '      client.println(line1);\n';
    expectedSnippet += '      client.println(line2);\n';
    expectedSnippet += '      client.println(line3);\n';
    expectedSnippet += '      client.println(line4withescapednewline\\n);\n';
    expectedSnippet += '      client.println();\n';
    expectedSnippet += '      client.println();\n';
    expectedSnippet += '      client.println();\n';

    snippet = getClientHttpSnippet('line1\nline2\nline3\nline4withescapednewline\\n\n\n\n');

    expect(snippet).to.equal(expectedSnippet);
  });
});

describe('getHost()', () => {
  const testCases = [
    { url: 'http://example.com', expected_host: 'example.com' },
    { url: 'https://example.com/watch?v=ClkQA2Lb_iE', expected_host: 'example.com' },
    { url: 'http://192.168.100.0:1234', expected_host: '192.168.100.0' },
    { url: { host: ['example', 'com'] }, expected_host: 'example.com' },
    { url: { host: ['subdomain', 'example', 'com'] }, expected_host: 'subdomain.example.com' }
  ];

  testCases.forEach(function (testCase) {
    it(`correctly gets the host of ${testCase.url}`, function () {
      expect(getHost({ url: testCase.url })).to.equal(testCase.expected_host);
    });
  });
});

describe('getPort()', () => {
  const testCases = [
    { url: 'http://example.com', expected_port: '80' },
    { url: 'https://example.com', expected_port: '443' },
    { url: 'http://example.com:8080', expected_port: '8080' },
    { url: 'https://example.com:8080', expected_port: '8080' },
    { url: 'http://192.168.100.0:1234', expected_port: '1234' },
    { url: 'http://192.168.100.0', expected_port: '80' },
    { url: { protocol: 'https', port: '23' }, expected_port: '23' },
    { url: { protocol: 'http' }, expected_port: 80 },
    { url: { protocol: 'https' }, expected_port: '443' }
  ];

  testCases.forEach(function (testCase) {
    it(`correctly gets the port of ${testCase.url}`, function () {
      expect(getPort({ url: testCase.url })).to.equal(testCase.expected_port);
    });
  });
});

