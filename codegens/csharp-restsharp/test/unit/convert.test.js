var expect = require('chai').expect,
    fs = require('fs'),
    sdk = require('postman-collection'),
    exec = require('shelljs').exec,
    newman = require('newman'),
    parallel = require('async').parallel,

    convert = require('../../lib/index').convert,
    mainCollection = require('./fixtures/testcollection/collection.json'),
    testCollection = require('./fixtures/testcollection/collectionForEdge.json'),
    getOptions = require('../../lib/index').getOptions;

/**
 * compiles and runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using C#
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
    const depedenciesPath = 'test/unit/fixtures/dependencies';

    fs.writeFile(`${depedenciesPath}/main.cs`, codeSnippet, function (err) {
        if (err) {
            expect.fail(null, null, err);
            return done();
        }

        //  bash command string for compiling C#
        var compile = `mcs -reference:${depedenciesPath}/RestSharp.dll` +
                ` -out:${depedenciesPath}/main.exe ${depedenciesPath}/main.cs`,

            //  bash command stirng for run compiled C# file
            run = `mono  ${depedenciesPath}/main.exe`;

        //  step by step process for compile, run code snippet, then comparing its output with newman
        parallel([
            function (callback) {
                exec(compile, function (err, stdout, stderr) {
                    if (err) {
                        return callback(err);
                    }
                    if (stderr) {
                        return callback(stderr);
                    }
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
                            console.error();
                        }

                        return callback(null, stdout);
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
                        console.error();
                    }
                    return callback(null, stdout);
                });
            }
        ], function (err, result) {
            if (err) {
                expect.fail(null, null, err);
            }
            else if (typeof result[1] !== 'object' || typeof result[0] !== 'object') {
                expect(result[0].trim()).to.equal(result[1].trim());
            }
            else {
                const propertiesTodelete = ['cookies', 'headersSize', 'startedDateTime'],
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
                        'cookie'
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
    });
}

describe('csharp restsharp function', function () {
    describe('convert for different request types', function () {
        var headerSnippet = 'using System;\n' +
                            'using RestSharp;\n' +
                            'namespace HelloWorldApplication {\n' +
                            'class HelloWorld {\n' +
                            'static void Main(string[] args) {\n',
            footerSnippet = '}\n}\n}\n';

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
                        indentCount: 1,
                        indentType: 'tab',
                        requestTimeout: 2000,
                        followRedirect: true,
                        trimRequestBody: true
                    };
                convert(request, options, function (error, snippet) {
                    if (error) {
                        expect.fail(null, null, error);
                        return;
                    }
                    runSnippet(headerSnippet + snippet + footerSnippet, collection, done);
                });
            });
            return false;
        });
    });

    describe('convert function', function () {
        var request = new sdk.Request(testCollection.item[0].request),
            snippetArray,
            options = {
                includeBoilerplate: true,
                indentType: 'space',
                indentCount: 2
            };

        it('should return snippet with boilerplate code given option', function () {
            convert(request, { includeBoilerplate: true }, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.include('using System;\nusing RestSharp;\nnamespace HelloWorldApplication {\n');
            });
        });

        it('should generate snippet with space as an indent type with exact indent count', function () {
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                snippetArray = snippet.split('\n');
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i].startsWith('namespace HelloWorldApplication {')) {
                        expect(snippetArray[i + 1].charAt(0)).to.equal(' ');
                        expect(snippetArray[i + 1].charAt(1)).to.equal(' ');
                        expect(snippetArray[i + 1].charAt(2)).to.not.equal(' ');
                    }
                }
            });
        });

    });

    describe('getOptions function', function () {
        it('should return array of options for csharp-restsharp converter', function () {
            expect(getOptions()).to.be.an('array');
        });

        it('should return all the valid options', function () {
            expect(getOptions()[0]).to.have.property('id', 'includeBoilerplate');
            expect(getOptions()[1]).to.have.property('id', 'indentCount');
            expect(getOptions()[2]).to.have.property('id', 'indentType');
            expect(getOptions()[3]).to.have.property('id', 'requestTimeout');
            expect(getOptions()[4]).to.have.property('id', 'followRedirect');
            expect(getOptions()[5]).to.have.property('id', 'requestBodyTrim');
        });
    });

});
