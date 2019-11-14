var _ = require('../lodash'),
  sanitize = require('./sanitize').sanitize;

module.exports = function (request, indentString, trim) {
  var bodySnippet = '',
    bodyFileMap = [],
    bodyDataMap = [],
    enabledBodyList;

  switch (request.body.mode) {
    case 'raw':
      bodySnippet += `$request->setBody('${sanitize(request.body[request.body.mode], trim)}');\n`;
      break;
    // eslint-disable-next-line no-case-declarations
    case 'graphql':
      let query = request.body[request.body.mode].query,
        graphqlVariables;
      try {
        graphqlVariables = JSON.parse(request.body[request.body.mode].variables);
      }
      catch (e) {
        graphqlVariables = {};
      }
      bodySnippet += `$request->setBody('${sanitize(JSON.stringify({
        query: query,
        variables: graphqlVariables
      }), trim)}');\n`;
      break;
    case 'urlencoded':
      enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
      if (!_.isEmpty(enabledBodyList)) {
        bodyDataMap = _.map(enabledBodyList, (data) => {
          return `${indentString}'${sanitize(data.key, trim)}' => '${sanitize(data.value, trim)}'`;
        });
        bodySnippet += `$request->addPostParameter(array(\n${bodyDataMap.join(',\n')}));\n`;
      }
      break;
    case 'formdata':
      enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
      if (!_.isEmpty(enabledBodyList)) {
        bodyDataMap = _.map(_.filter(enabledBodyList, {'type': 'text'}), function (data) {
          return `${indentString}'${sanitize(data.key, trim)}' => '${sanitize(data.value, trim)}'`;
        });
        bodyFileMap = _.map(_.filter(enabledBodyList, {'type': 'file'}), function (data) {
          return `${indentString}'${sanitize(data.key, trim)}', '${data.src}', <Content-Type Header>`;
        });
        if (bodyDataMap.length) {
          bodySnippet += `$request->addPostParameter(array(\n${bodyDataMap.join(',\n')}));\n`;
        }
        if (bodyFileMap.length) {
          bodySnippet += `$request->addUpload(array(\n${bodyDataMap.join(',\n')}));\n`;
        }
      }
      break;
    case 'file':
      bodySnippet += '$request->setBody(\'<file contents here>\');\n';
      break;
    default:
      break;
  }
  return bodySnippet;
};
