var codegenList = [
  {
    'type': 'code_generator',
    'lang': 'curl',
    'variant': 'curl',
    'syntax_mode': 'powershell',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/curl',
    'main': require('../../codegens/curl/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'go',
    'variant': 'native',
    'syntax_mode': 'golang',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/golang',
    'main': require('../../codegens/golang/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'JavaScript',
    'variant': 'Fetch',
    'syntax_mode': 'javascript',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/js-fetch',
    'main': require('../../codegens/js-fetch/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'javascript',
    'variant': 'jquery',
    'syntax_mode': 'javascript',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/js-jquery',
    'main': require('../../codegens/js-jquery/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'nodejs',
    'variant': 'native',
    'syntax_mode': 'javascript',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/nodejs-native',
    'main': require('../../codegens/nodejs-native/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'php',
    'variant': 'curl',
    'syntax_mode': 'php',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/php-curl',
    'main': require('../../codegens/php-curl/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'powershell',
    'variant': 'restmethod',
    'syntax_mode': 'powershell',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/powershell-restmethod',
    'main': require('../../codegens/powershell-restmethod/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'python',
    'variant': 'requests',
    'syntax_mode': 'python',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/python-requests',
    'main': require('../../codegens/python-requests/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'Ruby',
    'variant': 'net/http',
    'syntax_mode': 'ruby',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/ruby',
    'main': require('../../codegens/ruby/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'swift',
    'variant': 'URLSession',
    'syntax_mode': 'swift',
    'author': 'Postman Labs <help@getpostman.com>',
    'homepage': 'https://github.com/postmanlabs/code-generators/tree/master/codegens/swift',
    'main': require('../../codegens/swift/index.js')
  }
];
module.exports = codegenList;
