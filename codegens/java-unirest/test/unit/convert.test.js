var expect = require('chai').expect,
    fs = require('fs'),
    sdk = require('postman-collection'),
    exec = require('shelljs').exec,
    newman = require('newman'),
    parallel = require('async').parallel,

    convert = require('../../lib/index').convert,
    sanitize = require('../../lib/util').sanitize,
    getOptions = require('../../index').getOptions,
    mainCollection = require('./fixtures/testcollection/collection.json');

/**
 * compiles and runs codesnippet then compare it with newman output
 *
 * @param {String} codeSnippet - code snippet that needed to run using java
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runSnippet (codeSnippet, collection, done) {
    fs.writeFile('dependencies/main.java', codeSnippet, function (err) {
        if (err) {
            expect.fail(null, null, err);
            return done();
        }

        //  classpath of external libararies for java to compile
        var classpath = 'dependencies/*',

            //  bash command string for compiling java
            compile = 'javac -cp ' + classpath + ': dependencies/main.java',

            //  bash command stirng for run compiled java file
            run = 'java -cp ' + classpath + ':dependencies main';

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
                            console.error(e);
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
                expect(result[0].trim()).to.equal(result[1].trim());
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
                        'cache-control',
                        'postman-token',
                        'x-real-ip'
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

describe('java unirest convert function for test collection', function () {
    var headerSnippet = 'import com.mashape.unirest.http.*;\n' +
                        'import java.io.*;\n' +
                        'public class main {\n' +
                        'public static void main(String []args) throws Exception{\n',
        footerSnippet = 'System.out.println(response.getBody());\n}\n}\n';

    mainCollection.item.forEach(function (item) {
        // Skipping tests for CI
        it.skip(item.name, function (done) {
            var request = new sdk.Request(item.request),
                collection = {
                    item: [
                        {
                            request: request.toJSON()
                        }
                    ]
                };
            convert(request, {indentCount: 3, indentType: 'space'}, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                runSnippet(headerSnippet + snippet + footerSnippet, collection, done);
            });
        });
    });
    describe('convert function', function () {
        var request,
            reqObject,
            options = {},
            snippetArray,
            indentString = '\t',
            headerSnippet,
            footerSnippet,
            line_no;

        it('should return a tab indented snippet ', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                indentType: 'tab',
                indentCount: 1
            };
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }

                expect(snippet).to.be.a('string');
                snippetArray = snippet.split('\n');
                /* eslint-disable max-len */
                for (var i = 0; i < snippetArray.length; i++) {
                    if (snippetArray[i] === 'HttpResponse<String> response = Unirest.get("https://postman-echo.com/headers")') {
                        line_no = i + 1;
                    }
                }
                /* eslint-enable max-len */
                expect(snippetArray[line_no].charAt(0)).to.equal('\t');
            });
        });

        it('should return snippet with setTimeouts function when timeout is set to non zero', function () {
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
                expect(snippet).to.include('.setTimeouts(0, 1000)');
            });
        });

        it('should return snippet with setTimeouts function setting both ' +
            'connection and socket timeout to 0 when requestTimeout is set to 0', function () {
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
                expect(snippet).to.include('.setTimeouts(0, 0)');
            });
        });

        it('should return snippet with disableRedirectHandling function for' +
            'follow redirect option set to false', function () {
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
                expect(snippet).to.include('.disableRedirectHandling()');
            });
        });

        it('should include import statements, main class and print statements ' +
            'when includeBoilerplate is set to true', function () {
            request = new sdk.Request(mainCollection.item[0].request);
            options = {
                includeBoilerplate: true,
                indentType: 'tab',
                indentCount: 1
            };
            headerSnippet = 'import com.mashape.unirest.http.*;\n' +
                        'import java.io.*;\n' +
                        'public class main {\n' +
                        indentString + 'public static void main(String []args) throws Exception{\n';
            footerSnippet = indentString.repeat(2) + 'System.out.println(response.getBody());\n' +
                        indentString + '}\n}\n';

            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.include(headerSnippet);
                expect(snippet).to.include(footerSnippet);
            });
        });

        it('should return valid code snippet for no headers and no body', function () {
            reqObject = {
                'description': 'This is a sample POST request without headers and body',
                'url': 'https://echo.getpostman.com/post',
                'method': 'POST'
            };
            request = new sdk.Request(reqObject);
            options = {};
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.not.include('.header');
                expect(snippet).to.not.include('.body');
                expect(snippet).to.not.include('.field');
            });
        });

        it('should replace propfind by default get method as unirest java only supports standard ' +
        'six HTTP methods', function () {
            reqObject = {
                'description': 'This is a sample PROPFIND request',
                'url': 'https://mockbin.org/request',
                'method': 'PROPFIND'
            };
            request = new sdk.Request(reqObject);
            options = {};
            convert(request, options, function (error, snippet) {
                if (error) {
                    expect.fail(null, null, error);
                    return;
                }
                expect(snippet).to.be.a('string');
                expect(snippet).to.not.include('.propfind');
                expect(snippet).to.include('.get');
            });
        });
    });

    describe('getOptions function', function () {

        it('should return an array of specific options', function () {
            expect(getOptions()).to.be.an('array');
        });

        it('should return all the valid options', function () {
            expect(getOptions()[0]).to.have.property('id', 'includeBoilerplate');
            expect(getOptions()[1]).to.have.property('id', 'indentCount');
            expect(getOptions()[2]).to.have.property('id', 'indentType');
            expect(getOptions()[3]).to.have.property('id', 'requestTimeout');
            expect(getOptions()[4]).to.have.property('id', 'followRedirect');
            expect(getOptions()[5]).to.have.property('id', 'trimRequestBody');
        });
    });

    describe('sanitize function', function () {
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
