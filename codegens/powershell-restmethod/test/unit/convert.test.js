var expect = require('chai').expect,
    sdk = require('postman-collection'),
    exec = require('shelljs').exec,
    newman = require('newman'),
    parallel = require('async').parallel,
    fs = require('fs'),
    convert = require('../../lib/index').convert,
    sanitize = require('../../lib/util').sanitize,
    getOptions = require('../../lib/index').getOptions,
    mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using node
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
    fs.writeFileSync('snippet.ps1', codeSnippet);
    var run = 'node run.js';
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

describe('Powershell-restmethod converter', function () {
    describe('convert for different request types', function () {
        mainCollection.item.forEach(function (item) {
            // Skipping tests for Travis CI, till powershell dependency issue is sorted on travis
            it.skip(item.name, function (done) {
                var request = new sdk.Request(item.request),
                    collection = {
                        item: [
                            {
                                request: request.toJSON()
                            }
                        ]
                    },
                    options = {
                        requestTimeout: 10000,
                        multiLine: true,
                        followRedirect: true,
                        longFormat: true
                    };
                convert(request, options, function (error, snippet) {
                    if (error) {
                        expect.fail(null, null, error);
                        return;
                    }
                    runSnippet(snippet, collection, done);
                });
            });
        });
    });
    // Temporary test, remove once newman tests run on CI.
    describe('POST Raw text, snippet test', function () {
        it('should return valid snippet', function () {
            var request = {
                    'method': 'POST',
                    'header': [
                        {
                            'key': 'Content-Type',
                            'value': 'text/plain'
                        }
                    ],
                    'body': {
                        'mode': 'raw',
                        'raw': 'Hello world'
                    },
                    'url': {
                        'raw': 'https://mockbin.org/request',
                        'protocol': 'https',
                        'host': [
                            'mockbin',
                            'org'
                        ],
                        'path': [
                            'request'
                        ]
                    },
                    'description': 'Description'
                },
                pmRequest = new sdk.Request(request),
                options = {
                    requestTimeout: 10000,
                    multiLine: true,
                    followRedirect: true,
                    longFormat: true
                };
            convert(pmRequest, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                const lines = snippet.split('\n');
                expect(lines[0]).to
                    .eql('$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"');
                expect(lines[1]).to.eql('$headers.Add("Content-Type", \'text/plain\')');
                expect(lines[3]).to.eql('$body = "Hello world"');
                expect(lines[5]).to.eql('$response = Invoke-RestMethod \'https://mockbin.org/request\' -Method \'POST\' -Headers $headers -Body $body -TimeoutSec 10'); // eslint-disable-line max-len
                expect(lines[6]).to.eql('$response | ConvertTo-Json');
            });
        });
    });

    describe('Convert function ', function () {
        var request,
            options;
        it('should add a TimeoutSec argument when timeout is set to non zero value', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                requestTimeout: 1000
            };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.include('-TimeoutSec 1');
            });
        });

        it('should not add a TimeoutSec argument when timeout is set to 0', function () {
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
                expect(snippet).to.not.include('-TimeoutSec');
            });
        });

        it('should add a MaximumRedirection set to 0 argument when followRedirect is not allowed', function () {
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
                expect(snippet).to.include('-MaximumRedirection 0');
            });
        });

        it('should not add a MaximumRedirection argument when followRedirect is allowed', function () {
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
                expect(snippet).to.not.include('-MaximumRedirection');
            });
        });

        it('should default to mode raw when body mode is some random value', function () {
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
            });
        });

        it('should generate snippet for file body mode', function () {
            request = new sdk.Request({
                'url': 'https://echo.getpostman.com/post',
                'method': 'POST',
                'body': {
                    'mode': 'file',
                    'file': [
                        {
                            'key': 'fileName',
                            'src': 'file',
                            'type': 'file'
                        }
                    ]
                }
            });
            options = { indentType: 'space', indentCount: 2 };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.not.equal('');
            });
        });
    });

    describe('getOptions function', function () {

        it('should return an array of specific options', function () {
            expect(getOptions()).to.be.an('array');
        });

        it('should return all the valid options', function () {
            expect(getOptions()[0]).to.have.property('id', 'requestTimeout');
            expect(getOptions()[1]).to.have.property('id', 'followRedirect');
            expect(getOptions()[2]).to.have.property('id', 'trimRequestBody');
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


