var newman = require('newman'),
  fs = require('fs'),
  async = require('async'),
  path = require('path'),
  responses = [],
  responseObject = {},
  collections;
const PATH_TO_COLLECTIONS = path.resolve(__dirname, './fixtures'),
  PATH_TO_NEWMAN_REPONSES = path.resolve(__dirname, '../newman/newmanResponses.json');

/**
 * Runs a collection using newman
 *
 * @param {Object} collection - collection which will be run using newman
 * @param {String} collectionName - name of the collection which will be used as a key for storing in response object
 * @param {Function} done - callback for async calls
 */
function runNewman (collection, collectionName, done) {
  responses = [];
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
    responseObject[collectionName] = responses;
    return done(null, '\nNewman run complete with no errors for collection ' + collectionName + '\n');
  });
}

/**
 *
 * @param {String} collection_folder - path to the collections folder
 * @returns {Array} - Array of objects, with each object containing path and name of the collection
 */
function getCollections (collection_folder) {
  return fs.readdirSync(collection_folder)
    .map((collection) => {
      return {
        path: path.join(collection_folder, collection),
        name: collection.includes('.') ? collection.split('.')[0] : collection
      };
    });
}

collections = getCollections(PATH_TO_COLLECTIONS);
async.eachSeries(collections, (collection, callback) => {
  var collectionJSON = require(collection.path),
    collectionName = collection.name;
  runNewman(collectionJSON, collectionName, (err, out) => {
    if (err) {
      return callback(err);
    }
    console.log(out);
    return callback(null);
  });
}, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  fs.writeFile(PATH_TO_NEWMAN_REPONSES, JSON.stringify(responseObject, null, 2), function (err) {
    if (err) {
      console.log(err);
    }
  });
});
