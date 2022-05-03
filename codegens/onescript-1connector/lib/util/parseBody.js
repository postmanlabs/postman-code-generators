var _ = require('../lodash'),
  sanitize = require('./sanitize').sanitize;

/**
 * Used to format string
 *
 * @param  {String} strData - costring to sanitaize
 * @returns {String} - request body
 */
function toOneScriptString (strData) {
  strData = strData.replace(/\r/g, 'СимволыВК');
  var arrayOfStrings = strData.split('\n');
  if (arrayOfStrings.length === 1) {
    strData = strData.replace(/"/g, '""');
    return `"${strData}";`;
  }

  let result = arrayOfStrings.map(function (item, key) {
    item = item.replace(/"/g, '""');
    if (key === 0) {
      return item;
    }
    return `|${item}`;
  });

  return `"${result.join('\n').replace(/СимволыВК/g, '" + Символы.ВК + "')}";`;
}

/**
 * Used to parse the body of the postman SDK-request and return in the desired format
 *
 * @param  {Object} request - postman SDK-request object
 * @param  {String} indentation - used for indenting snippet's structure
 * @param  {Boolean} bodyTrim - whether to trim request body fields
 * @returns {String} - request body
 */
module.exports = function (request, indentation, bodyTrim) {
  // used to check whether body is present in the request or not

  if (request.body) {

    var requestBody = '',
      bodyDataMap,
      bodyFileMap,
      enabledBodyList;

    switch (request.body.mode) {
      case 'raw':
        requestBody += `Данные = ${toOneScriptString(
          request.body[request.body.mode])}\n`;
        requestBody += 'ДополнительныеПараметры.Вставить("Данные", Данные);\n';
        return requestBody;


      case 'graphql':
        // eslint-disable-next-line no-case-declarations
        let query = request.body[request.body.mode].query,
          graphqlVariables;
        try {
          graphqlVariables = JSON.parse(request.body[request.body.mode].variables);
        }
        catch (e) {
          graphqlVariables = {};
        }

        requestBody += `Данные = ${toOneScriptString(
          JSON.stringify(
            {
              query: query,
              variables: graphqlVariables
            }, null, ' '
          ))}\n`;

        requestBody += 'ДополнительныеПараметры.Вставить("Данные", Данные);\n';
        return requestBody;

      case 'urlencoded':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyDataMap = _.map(enabledBodyList, function (value) {
            return `${sanitize(value.key, request.body.mode, bodyTrim)}=` +
              `${sanitize(value.value, request.body.mode, bodyTrim)}`;
          });
          requestBody += `Данные = ${toOneScriptString(bodyDataMap.join('&'))}\n`;
        }
        else {
          requestBody = 'Данные ="";\n';
        }
        requestBody += 'ДополнительныеПараметры.Вставить("Данные", Данные);\n';
        return requestBody;
      case 'formdata':

        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyDataMap = _.map(_.filter(enabledBodyList, {
            'type': 'text'
          }), function (value) {
            return `Данные.Вставить("${value.key}", "${value.value.replace(/"/g, '""')}");`;
          });
          bodyFileMap = _.map(_.filter(enabledBodyList, {
            'type': 'file'
          }), function (value) {
            var filesrc = value.src;

            let strBodyFile = 'СтруктураФайл = Новый Структура;\n';
            strBodyFile += `СтруктураФайл.Вставить("Имя", "${value.key}");\n`;
            strBodyFile += `СтруктураФайл.Вставить("Данные", Новый ДвоичныеДанные("${filesrc}"));\n`;
            strBodyFile += `СтруктураФайл.Вставить("ИмяФайла", 
              "${filesrc.split('/')[filesrc.split('/').length - 1]}");\n`;
            strBodyFile += 'Файлы.Добавить(СтруктураФайл);\n';
            return strBodyFile;

          });

          if (!_.isEmpty(bodyDataMap)) {
            requestBody += 'Данные = Новый Структура;\n';
            requestBody += bodyDataMap.join('\n');
            requestBody += '\nДополнительныеПараметры.Вставить("Данные", Данные);\n';
          }

          if (!_.isEmpty(bodyFileMap)) {
            requestBody += 'Файлы = Новый Массив;\n';
            requestBody += bodyFileMap.join('\n');
            requestBody += 'ДополнительныеПараметры.Вставить("Файлы", Файлы);\n\n';
          }
        }
        else {
          requestBody = '';
        }
        return requestBody;
      case 'file':

        requestBody = `Данные = Новый ДвоичныеДанные("${request.body[request.body.mode].src}"));\n`;
        return requestBody;
      default:
        return '';
    }
  }
  return '';
};
