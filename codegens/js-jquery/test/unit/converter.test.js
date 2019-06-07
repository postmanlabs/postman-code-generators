var expect = require('chai').expect,
    sdk = require('postman-collection'),
    fs = require('fs'),

    convert = require('../../lib/index').convert,
    mainCollection = require('../unit/fixtures/sample_collection.json'),
    snippetFixture;

/* global describe, it */
describe('jQuery converter', function () {
    before(function (done) {
        fs.readFile('./test/unit/fixtures/snippetFixtures.json', function (err, data) {
            if (err) {
                throw err;
            }
            snippetFixture = JSON.parse(data.toString());
            done();
        });
    });

    it('should throw an error if callback is not function', function () {
        expect(function () { convert({}, {}); })
            .to.throw('js-jQuery~convert: Callback is not a function');
    });

    mainCollection.item.forEach(function (item) {
        it(item.name, function (done) {
            var request = new sdk.Request(item.request);
            convert(request, {indentType: 'space',
                indentCount: 4,
                requestTimeout: 100,
                trimRequestBody: false,
                addCacheHeader: false,
                followRedirect: true}, function (err, snippet) {
                if (err) {
                    console.error(err);
                }
                expect(snippet).to.equal(unescape(snippetFixture[item.name]));
            });
            done();
        });
    });

    it('should return snippet without errors when request object has no body property', function () {
        var request = new sdk.Request({
                'method': 'GET',
                'header': [],
                'url': {
                    'raw': 'https://google.com',
                    'protocol': 'https',
                    'host': [
                        'google',
                        'com'
                    ]
                }
            }),
            options = {
                indentType: 'space',
                indentCount: 4,
                requestTimeout: 100,
                trimRequestBody: false,
                addCacheHeader: false,
                followRedirect: true
            };

        convert(request, options, function (error, snippet) {
            if (error) {
                expect.fail(null, null, error);
            }
            expect(snippet).to.be.a('string');
            expect(snippet).to.include('"url": "https://google.com"');
            expect(snippet).to.include('"method": "GET"');
        });
    });
});
