var expect = require('chai').expect,
    sdk = require('postman-collection'),
    exec = require('shelljs').exec,
    newman = require('newman'),
    parallel = require('async').parallel,
    fs = require('fs'),

    sanitize = require('../../lib/util').sanitize,
    getOptions = require('../../index').getOptions,
    convert = require('../../index').convert,
    mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
    fs.writeFileSync('snippet.js', codeSnippet);
    var run = 'node snippet.js';
    //  step by step process for compile, run code snippet, then comparing its output with newman
    parallel([
        function (callback) {
            return exec(run, function (err, stdout, stderr) {
                if (err) {
                    return callback(err);
                }
                if (stderr) {
                    return callback(stderr);
                }
                try {
                    stdout = JSON.parse(stdout);
                }
                catch (e) {
                    console.error(e);
                }
                return callback(null, stdout);
            });
        },
        function (callback) {
            newman.run({
                collection: collection
            }).on('request', function (err, summary) {
                if (err) {
                    return callback(err);
                }

                var stdout = summary.response.stream.toString();
                try {
                    stdout = JSON.parse(stdout);
                }
                catch (e) {
                    console.error(e);
                }
                return callback(null, stdout);
            });
        }
    ], function (err, result) {
        if (err) {
            expect.fail(null, null, err);
        }
        else if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
            expect(result[0].trim()).to.include(result[1].trim());
        }
        else {
            const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'clientIPAddress'],
                headersTodelete = [
                    'accept-encoding',
                    'user-agent',
                    'cf-ray',
                    'x-request-id',
                    'x-request-start',
                    'connect-time',
                    'x-forwarded-for',
                    'content-type',
                    'content-length',
                    'accept',
                    'total-route-time',
                    'cookie',
                    'kong-cloud-request-id',
                    'x-real-ip',
                    'cache-control',
                    'postman-token'
                ];
            if (result[0]) {
                propertiesTodelete.forEach(function (property) {
                    delete result[0][property];
                });
                if (result[0].headers) {
                    headersTodelete.forEach(function (property) {
                        delete result[0].headers[property];
                    });
                }
            }
            if (result[1]) {
                propertiesTodelete.forEach(function (property) {
                    delete result[1][property];
                });
                if (result[1].headers) {
                    headersTodelete.forEach(function (property) {
                        delete result[1].headers[property];
                    });
                }
            }

            expect(result[0]).deep.equal(result[1]);
        }
        return done();
    });
}

describe('js-fetch convert function for test collection', function () {
    var testSnippet = 'var fetch = require(\'node-fetch\'),\nFormData = require(\'form-data\'),\n';
    testSnippet += 'Headers = require(\'node-fetch\').Headers,\n';
    testSnippet += 'URLSearchParams = require(\'url\').URLSearchParams;\n\n';

    mainCollection.item.forEach(function (item) {
        it(item.name, function (done) {
            var request = new sdk.Request(item.request),
                collection = {
                    item: [
                        {
                            request: request.toJSON()
                        }
                    ]
                },
                options = {
                    indentCount: 2,
                    indentType: 'tab',
                    requestTimeout: 4000,
                    multiLine: true,
                    followRedirect: true,
                    longFormat: true
                };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                runSnippet(testSnippet + snippet, collection, done);
            });
        });
    });

    describe('Convert function', function () {
        var request,
            options,
            snippetArray,
            line_no;

        it('should return a space indented snippet ', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                indentType: 'space',
                indentCount: 2
            };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }

                expect(snippet).to.be.a('string');
                snippetArray = snippet.split('\n');
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i] === 'var requestOptions = {') { line_no = i + 1; }
                }
                expect(snippetArray[line_no].charAt(0)).to.equal(' ');
                expect(snippetArray[line_no].charAt(1)).to.equal(' ');
            });
        });

        it('should return snippet with no setTimeout function when timeout is set to zero', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                requestTimeout: 0
            };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.not.include('.setTimeout');
            });
        });

        it('should return snippet with redirect property set to manual for ' +
                'no follow redirect', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                followRedirect: false
            };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.include('redirect: \'manual\'');
            });
        });

        it('should return snippet with redirect property set to follow for ' +
                ' follow redirect', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                followRedirect: true
            };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.include('redirect: \'follow\'');
            });
        });

        it('should default to mode raw body mode is some random value', function () {
            request = new sdk.Request(mainCollection.item[2].request);
            request.body.mode = 'random';
            request.body[request.body.mode] = {};
            options = {};
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.include('body: raw');
            });
        });
    });

    describe('getOptions function', function () {

        it('should return an array of specific options', function () {
            expect(getOptions()).to.be.an('array');
        });

        it('should return all the valid options', function () {
            expect(getOptions()[0]).to.have.property('id', 'indentCount');
            expect(getOptions()[1]).to.have.property('id', 'indentType');
            expect(getOptions()[2]).to.have.property('id', 'requestTimeout');
            expect(getOptions()[3]).to.have.property('id', 'followRedirect');
            expect(getOptions()[4]).to.have.property('id', 'requestBodyTrim');
        });
    });

    describe('Sanitize function', function () {

        it('should return empty string when input is not a string type', function () {
            expect(sanitize(123, false)).to.equal('');
            expect(sanitize(null, false)).to.equal('');
            expect(sanitize({}, false)).to.equal('');
            expect(sanitize([], false)).to.equal('');
        });

        it('should trim input string when needed', function () {
            expect(sanitize('inputString     ', true)).to.equal('inputString');
        });
    });

});
