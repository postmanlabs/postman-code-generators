var newman = require('newman'),
  fs = require('fs'),
  path = require('path'),
  responses = [];
const collection = require('../newman/fixtures/testCollection.json'),
  PATH_TO_NEWMAN_REPONSES = path.resolve(__dirname, '../newman/newmanResponses.json');

/**
 * Runs a collection using newman
 *
 * @param {Object} collection - collection which will be run using newman
 * @param {Function} done - callback for async calls
 */
function runNewman (collection, done) {
  newman.run({
    collection: collection
  }).on('beforeItem', function (err, summary) {
    if (err) {
      return done(err);
    }
    console.log('Sending request: ' + summary.item.name);
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
    console.log('Done: ' + summary.item.name);
  }).on('done', function (err) {
    if (err) {
      return done(err);
    }
    fs.writeFile(PATH_TO_NEWMAN_REPONSES, JSON.stringify(responses, null, 2), function (err) {
      if (err) {
        console.log(err);
      }
    });
    return done(null, 'Newman run complete with no errors');
  });
}

runNewman(collection, function (err, out) {
  if (err) {
    console.log(err);
  }
  console.log(out);
});
