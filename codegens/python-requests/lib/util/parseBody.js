var _ = require('../lodash'),
  sanitize = require('./sanitize').sanitize,
  contentTypeHeaderMap = {
    'aac': 'audio/aac',
    'abw': 'application/x-abiword',
    'arc': 'application/x-freearc',
    'avi': 'video/x-msvideo',
    'azw': 'application/vnd.amazon.ebook',
    'bin': 'application/octet-stream',
    'bmp': 'image/bmp',
    'bz': 'application/x-bzip',
    'bz2': 'application/x-bzip2',
    'csh': 'application/x-csh',
    'css': 'text/css',
    'csv': 'text/csv',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'eot': 'application/vnd.ms-fontobject',
    'epub': 'application/epub+zip',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/vnd.microsoft.icon',
    'ics': 'text/calendar',
    'jar': 'application/java-archive',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'jsonld': 'application/ld+json',
    'mid': 'audip/midi',
    'midi': 'audio/midi',
    'mjs': 'text/javascript',
    'mp3': 'audio/mpeg',
    'mpeg': 'video/mpeg',
    'mpkg': 'application/vnd.apple.installer+xml',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odt': 'application/vnd.oasis.opendocument.text',
    'oga': 'audio/ogg',
    'ogv': 'video/ogg',
    'ogx': 'application/ogg',
    'otf': 'font/otf',
    'png': 'image/png',
    'pdf': 'application/pdf',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'rar': 'application/x-rar-compressed',
    'rtf': 'application/rtf',
    'sh': 'application/x-sh',
    'svg': 'image/svg+xml',
    'swf': 'application/x-shockwave-flash',
    'tar': 'application/x-tar',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'ts': 'video/mp2t',
    'ttf': 'font/ttf',
    'txt': 'text/plain',
    'vsd': 'application/vnd.visio',
    'wav': 'audio/wav',
    'weba': 'audio/webm',
    'webm': 'video/webm',
    'webp': 'image/webp',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'xhtml': 'application/xhtml+xml',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xml': 'text/xml',
    'xul': 'application/vnd.mozilla.xul+xml',
    'zip': 'application/zip',
    '3gp': 'video/3gpp',
    '7z': 'application/x-7z-compressed',
    '7-zip': 'application/x-7z-compressed'
  };

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
        if (!_.isEmpty(request.body[request.body.mode])) {
          requestBody += `payload = ${sanitize(request.body[request.body.mode],
            request.body.mode, bodyTrim)}\n`;
        }
        else {
          requestBody = 'payload  = {}\n';
        }
        return requestBody;
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
        requestBody += `payload = ${sanitize(JSON.stringify({
          query: query,
          variables: graphqlVariables
        }),
        'raw', bodyTrim)}\n`;
        return requestBody;
      case 'urlencoded':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyDataMap = _.map(enabledBodyList, function (value) {
            return `${sanitize(value.key, request.body.mode, bodyTrim)}=` +
                        `${sanitize(value.value, request.body.mode, bodyTrim)}`;
          });
          requestBody += `payload = '${bodyDataMap.join('&')}'\n`;
        }
        else {
          requestBody = 'payload = {}\n';
        }
        return requestBody;
      case 'formdata':
        enabledBodyList = _.reject(request.body[request.body.mode], 'disabled');
        if (!_.isEmpty(enabledBodyList)) {
          bodyDataMap = _.map(_.filter(enabledBodyList, {'type': 'text'}), function (value) {
            return (`'${sanitize(value.key, request.body.mode, bodyTrim)}': ` +
                            `'${sanitize(value.value, request.body.mode, bodyTrim)}'`);
          });
          bodyFileMap = _.map(_.filter(enabledBodyList, {'type': 'file'}), function (value) {
            var filesrc = value.src,
              filetype = filesrc.split('.')[filesrc.split('.').length - 1];
            return `${indentation}('${value.key}',('${filesrc}'` +
                    `,open('${sanitize(filesrc, request.body.mode, bodyTrim)}','rb'),` +
                    `'${contentTypeHeaderMap[filetype]}'))`;
          });
          requestBody = `payload = {${bodyDataMap.join(',\n')}}\nfiles = [\n${bodyFileMap.join(',\n')}\n]\n`;
        }
        else {
          requestBody = 'payload = {}\nfiles = {}\n';
        }
        return requestBody;
      case 'file':
        // return `payload = {open('${request.body[request.body.mode].src}', 'rb').read()\n}`;
        return 'payload = "<file contents here>"\n';
      default:
        return 'payload = {}\n';
    }
  }
  return 'payload = {}\n';
}
;
