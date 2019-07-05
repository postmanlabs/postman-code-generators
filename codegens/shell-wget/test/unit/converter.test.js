var expect = require('chai').expect,
    fs = require('fs'),
    sdk = require('postman-collection'),
    exec = require('shelljs').exec,
    newman = require('newman'),
    parallel = require('async').parallel,
    sanitize = require('../../lib/util/sanitize').sanitize,
    convert = require('../../lib/index').convert,
    getOptions = require('../../lib/index').getOptions,
    mainCollection = require('../unit/fixtures/sample_collection.json');

    // properties and headers to delete from newman reponse and cli response
const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'json', 'data', 'clientIPAddress'],
    headersTodelete = [
        'accept-encoding',
        'user-agent',
        'cf-ray',
        'x-request-id',
        'x-request-start',
        'x-real-ip',
        'connect-time',
        'x-forwarded-for',
        'content-type',
        'content-length',
        'accept',
        'cookie',
        'total-route-time',
        'kong-cloud-request-id',
        'cache-control',
        'postman-token'
    ];

/**
 * Executes codesnippet and compares output with newman response
 *
 * @param {String} codeSnippet - code snippet from convert function
 * @param {Object} collection - sample collection
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
    fs.writeFile('test/unit/fixtures/snippet', codeSnippet, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        parallel([
            function (callback) {
                exec(codeSnippet, function () {
                    fs.readFile('./shellWget.txt', function read (err, data) {
                        if (err) {
                            throw err;
                        }
                        callback(null, data);
                    });
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
                    callback(null, stdout);
                });
            }
        ], function (err, result) {
            if (err) {
                expect.fail(null, null, err);
            }
            else if (typeof result[1] !== 'object' && typeof result[0] !== 'object') {
                expect(result[0].trim()).to.equal(result[1].trim());
            }
            else {
                result[0] = JSON.parse(result[0]);
                if (result[0]) {
                    propertiesTodelete.forEach(function (property) {
                        delete result[0][property];
                    });
                    if (result[0].headers) {
                        headersTodelete.forEach(function (property) {
                            delete result[0].headers[property];
                        });
                    }
                    if (result[0].url) {
                        result[0].url = unescape(result[0].url);
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
                    if (result[1].url) {
                        result[1].url = unescape(result[1].url);
                    }
                }
                expect(result[0]).deep.equal(result[1]);
            }
            done();
        });
    });
}

describe('Shell-Wget converter', function () {
    mainCollection.item.forEach(function (item) {
        it(item.name, function (done) {
            var request = new sdk.Request(item.request),
                collection = {
                    item: [
                        {
                            request: request.toJSON()
                        }
                    ]
                };
            convert(request, {indentType: 'space',
                indentCount: 4,
                requestTimeout: 0,
                trimRequestBody: false,
                addCacheHeader: false,
                followRedirect: true}, function (err, snippet) {
                if (err) {
                    console.error(err);
                }
                runSnippet(snippet, collection, done);
            });

        });
    });

    describe('convert function', function () {
        var request = new sdk.Request(mainCollection.item[0].request),
            snippetArray,
            options = {
                indentType: 'tab',
                indentCount: 2
            };

        const SINGLE_SPACE = ' ',
            SINGLE_TAB = '\t';

        it('should return snippet with requestTimeout given option', function () {
            convert(request, { requestTimeout: 10000 }, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.include('--timeout=10');
            });
        });

        it('should return snippet without followRedirect given option', function () {
            convert(request, { followRedirect: false }, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.include('--max-redirect=0');
            });
        });

        it('should generate snippet with default options given no options', function () {
            convert(request, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                snippetArray = snippet.split('\n');
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i].startsWith('wget --no-check-certificate --quiet')) {
                        expect(snippetArray[i + 1].substr(0, 4)).to.equal(SINGLE_SPACE.repeat(4));
                        expect(snippetArray[i + 1].charAt(4)).to.not.equal(SINGLE_SPACE);
                    }
                }
            });
        });

        it('should generate snippet with tab as an indent type with exact indent count', function () {
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                snippetArray = snippet.split('\n');
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i].startsWith('wget --no-check-certificate --quiet')) {
                        expect(snippetArray[i + 1].substr(0, 2)).to.equal(SINGLE_TAB.repeat(2));
                        expect(snippetArray[i + 1].charAt(2)).to.not.equal(SINGLE_TAB);
                    }
                }
            });
        });

        it('should generate snippet with timout flag set as 0 (infinite) when requestTimeout is set as 0', function () {
            convert(request, {requestTimeout: 0}, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.include('--timeout=0');
            });
        });
    });

    describe('getOptions function', function () {
        it('should return array of options for csharp-restsharp converter', function () {
            expect(getOptions()).to.be.an('array');
        });

        it('should return all the valid options', function () {
            expect(getOptions()[0]).to.have.property('id', 'indentCount');
            expect(getOptions()[1]).to.have.property('id', 'indentType');
            expect(getOptions()[2]).to.have.property('id', 'requestTimeout');
            expect(getOptions()[3]).to.have.property('id', 'followRedirect');
            expect(getOptions()[4]).to.have.property('id', 'trimRequestBody');
        });
    });

    describe('sanitize function', function () {
        it('should handle invalid parameters', function () {
            expect(sanitize(123, 'raw', false)).to.equal('');
            expect(sanitize('inputString', 123, false)).to.equal('inputString');
            expect(sanitize(' inputString', 'test', true)).to.equal('inputString');
        });
    });
});
