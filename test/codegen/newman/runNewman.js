var newman = require('newman'),
  fs = require('fs'),
  path = require('path'),
  responses = [];
const collection = require('../newman/fixtures/testCollection.json'),
  PATH_TO_NEWMAN_REPONSES = path.resolve(__dirname, '../newman/newmanResponses.json');

/**
 * compiles and runs codesnippet then compare it with newman output
 *
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runNewman (collection, done) {
  newman.run({
    collection: collection
  }).on('request', function (err, summary) {
    if (err) {
      return done(err);
    }

    var stdout = summary.response.stream.toString();
    try {
      stdout = JSON.parse(stdout);
    }
    catch (e) {
      console.error();
    }

    responses.push(stdout);
  }).on('done', function (err) {
    if (err) {
      return done(err);
    }
    fs.writeFile(PATH_TO_NEWMAN_REPONSES, JSON.stringify(responses, null, 2), function (err) {
      if (err) {
        console.log(err);
      }
    });
    return done(null, 'done');
  });
}

runNewman(collection, function (err, out) {
  if (err) {
    console.log(err);
  }
  console.log(out);
});
