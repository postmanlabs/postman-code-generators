var expect = require('chai').expect,
  sdk = require('postman-collection'),
  path = require('path'),
  fs = require('fs'),
  args = process.argv.splice(2),
  codegen = args[1],
  CODEGEN_ABS_PATH = path.resolve(__dirname, `../../../codegens/${codegen}`),
  collections = fs.readdirSync(path.resolve(__dirname, '../newman/fixtures/')),
  converter = require(CODEGEN_ABS_PATH + '/index.js');

describe('Sanity tests for ' + codegen, function () {
  collections.forEach((collection) => {
    var collectionName = collection;
    collection = fs.readFileSync(path.resolve(__dirname, '../newman/fixtures/' + collection)).toString();
    collection = JSON.parse(collection);

    collection.item.forEach((item) => {
      var request = new sdk.Request(item.request);
      it('should generate snippet for ' + collectionName.split('.')[0] + ' request: ' + item.name, function (done) {
        converter.convert(request, {}, function (error, snippet) {
          if (error) {
            expect.fail(null, null, error);
            return done();
          }

          expect(snippet).to.be.a('string');
          return done();
        });
      });
    });
  });
});

