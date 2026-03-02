const expect = require('chai').expect,
  lib = require('../../lib'),
  labels = require('../../lib/assets/languageLabels.json');

describe('lib', function () {
  describe('getLanguageList', function () {
    it('should test that each language has a valid label', function () {
      const list = lib.getLanguageList();

      expect(list).to.be.an('array');

      list.forEach(function (lang) {
        expect(lang).to.have.property('key');
        expect(lang).to.have.property('label');
        expect(lang.label).to.equal(labels[lang.key]);
      });
    });
  });
});
