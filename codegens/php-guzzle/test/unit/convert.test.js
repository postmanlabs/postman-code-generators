var expect = require('chai').expect,
  { convert } = require('../../index'),
  sdk = require('postman-collection'),
  fs = require('fs'),
  path = require('path');

describe('convert function', function () {
  const collection = new sdk.Collection(JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './fixtures/sample_collection.json').toString())));

  it('should convert requests with asyncType option as async', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { asyncType: 'async' }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('$client->sendAsync(');
      });
    });
    done();
  });

  it('should convert requests with asyncType option not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('$client->sendAsync(');
      });
    });
    done();
  });

  it('should convert requests with sync option as sync', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { asyncType: 'sync' }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('$client->send(');
      });
    });
    done();
  });

  it('should convert requests with includeBoilerplate option as true', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { includeBoilerplate: true }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('<?php\n' +
        '$composerHome = substr(shell_exec(\'composer config home -g\'), 0, -1).\'/vendor/autoload.php\';\n');
      });
    });
    done();
  });

  it('should convert requests with includeBoilerplate option not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('<?php\n' +
        '$composerHome = substr(shell_exec(\'composer config home -g\'), 0, -1).\'/vendor/autoload.php\';\n');
      });
    });
    done();
  });

  it('should convert requests with includeBoilerplate option as false', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { includeBoilerplate: false }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('<?php\n' +
        '$composerHome = substr(shell_exec(\'composer config home -g\'), 0, -1).\'/vendor/autoload.php\';\n');
      });
    });
    done();
  });

  it('should convert requests with followRedirect option not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('\'allow_redirects\' => false');
      });
    });
    done();
  });

  it('should convert requests with followRedirect option as true', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { followRedirect: true }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('\'allow_redirects\' => false');
      });
    });
    done();
  });

  it('should convert requests with followRedirect option as false', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { followRedirect: false }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('\'allow_redirects\' => false');
      });
    });
    done();
  });

  it('should throw an error when callback is not a function', function () {
    expect(function () { convert({}, {}); })
      .to.throw('Php-Guzzle~convert: Callback is not a function');
  });

  it('should convert requests with requestTimeout option set as 500', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { requestTimeout: 500 }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.include('\'timeout\' => 500');
      });
    });
    done();
  });

  it('should convert requests with requestTimeout option not present', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { requestTimeout: 0 }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('\'timeout\'');
      });
    });
    done();
  });

  it('should convert requests with requestTimeout option set as 0', function (done) {
    collection.items.members.forEach((item) => {
      convert(item.request, { requestTimeout: 0 }, function (err, snippet) {
        if (err) {
          console.error(err);
        }
        expect(snippet).to.not.be.empty;
        expect(snippet).to.not.include('\'timeout\' => 0');
      });
    });
    done();
  });

});
