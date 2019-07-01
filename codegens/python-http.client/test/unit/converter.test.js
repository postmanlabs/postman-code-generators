var expect = require('chai').expect,
    fs = require('fs'),
    sdk = require('postman-collection'),
    exec = require('shelljs').exec,
    newman = require('newman'),
    parallel = require('async').parallel,

    convert = require('../../lib/index').convert,
    getOptions = require('../../lib/index').getOptions,
    parseBody = require('../../lib/util/parseBody'),
    sanitize = require('../../lib/util/sanitize').sanitize,
    mainCollection = require('../unit/fixtures/sample_collection.json');

    // properties and headers to delete from newman reponse and cli response
const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime', 'json', 'data'],
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
    fs.writeFile('test/unit/fixtures/codesnippet.py', codeSnippet, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        parallel([
            function (callback) {
                exec('python3 test/unit/fixtures/codesnippet.py', function (err, stdout, stderr) {
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
            else if (typeof result[1] !== 'object' && typeof result[0] !== 'object') {
                expect(result[0].trim()).to.equal(result[1].trim());
            }
            else {
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

describe('Python- Requests converter', function () {
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
                requestBodyTrim: false,
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
            snippetArray;

        const SINGLE_SPACE = ' ';

        it('should throw an error when callback is not function', function () {
            expect(function () { convert({}, {}); })
                .to.throw('Python-Http.Client~convert: Callback is not a function');
        });

        it('should generate snippet with default indent type and count for no options passed', function () {
            convert(request, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                snippetArray = snippet.split('\n');
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i].startsWith('headers ={')) {
                        expect(snippetArray[i + 1].substr(0, 4)).to.equal(SINGLE_SPACE.repeat(4));
                        expect(snippetArray[i + 1].charAt(4)).to.not.equal(SINGLE_SPACE);
                    }
                }
            });
        });

        it('should generate snippet with tab as an indent type', function () {
            convert(request, { indentType: 'tab', indentCount: 1 }, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                snippetArray = snippet.split('\n');
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i].startsWith('headers ={')) {
                        expect(snippetArray[i + 1].charAt(0)).to.equal('\t');
                        expect(snippetArray[i + 1].charAt(1)).to.not.equal('\t');
                    }
                }
            });
        });

        it('should generate snippet with requestTimeout option', function () {
            var request = new sdk.Request(mainCollection.item[0].request);
            convert(request, { requestTimeout: 2000 }, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.include(' timeout = 2000');
            });
        });

    });

    describe('parseBody function', function () {
        var requestEmptyFormdata = new sdk.Request({
                'method': 'POST',
                'header': [],
                'body': {
                    'mode': 'formdata',
                    'formdata': []
                }
            }),
            requestEmptyUrlencoded = new sdk.Request({
                'method': 'POST',
                'header': [],
                'body': {
                    'mode': 'urlencoded',
                    'urlencoded': []
                }
            }),
            requestEmptyRaw = new sdk.Request({
                'method': 'POST',
                'header': [],
                'body': {
                    'mode': 'raw',
                    'raw': ''
                }
            });

        it('should parse body when body type is valid but body is empty', function () {
            expect(parseBody(requestEmptyFormdata.toJSON(), '\t', true)).to.be.a('string').to.equal('boundary = \'\'\npayload = \'\'\n'); // eslint-disable-line max-len
            expect(parseBody(requestEmptyUrlencoded.toJSON(), '\t', true)).to.be.a('string').to.equal('payload = \'\'\n'); // eslint-disable-line max-len
            expect(parseBody(requestEmptyRaw.toJSON(), '\t', true)).to.be.a('string').to.equal('payload = \'\'\n'); // eslint-disable-line max-len
        });

    });

    describe('getOptions function', function () {
        it('should return array of options for python-http-client converter', function () {
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
            expect(sanitize('inputString', '123', true)).to.equal('inputString');
        });
    });

});
