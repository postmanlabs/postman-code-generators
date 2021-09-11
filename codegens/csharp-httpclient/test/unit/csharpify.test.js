var expect = require('chai').expect,
  csharpify = require('../../lib/util').csharpify;

describe('csharpify function', function () {
  const THEORIES = [
    ['test', 'Test'],
    ['TEST', 'Test'],
    ['TeSt', 'Test'],
    ['', ''],
    [123, ''],
    [{}, ''],
    [[], ''],
    [null, '']
  ];

  THEORIES.forEach(function ([input, expected]) {
    it(`Should transform ${input} into ${expected}`, function () {
      expect(csharpify(input)).equal(expected);
    });
  });
});
