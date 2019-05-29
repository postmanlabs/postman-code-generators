var codegenList = [
  {
    'type': 'code_generator',
    'lang': 'curl',
    'variant': 'curl',
    'syntax_mode': 'powershell',
    'main': require('../../codegens/curl/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'go',
    'variant': 'native',
    'syntax_mode': 'golang',
    'main': require('../../codegens/golang/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'JavaScript',
    'variant': 'Fetch',
    'syntax_mode': 'javascript',
    'main': require('../../codegens/js-fetch/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'javascript',
    'variant': 'jquery',
    'syntax_mode': 'javascript',
    'main': require('../../codegens/js-jquery/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'nodejs',
    'variant': 'native',
    'syntax_mode': 'javascript',
    'main': require('../../codegens/nodejs-native/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'php',
    'variant': 'curl',
    'syntax_mode': 'php',
    'main': require('../../codegens/php-curl/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'powershell',
    'variant': 'restmethod',
    'syntax_mode': 'powershell',
    'main': require('../../codegens/powershell-restmethod/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'python',
    'variant': 'requests',
    'syntax_mode': 'python',
    'main': require('../../codegens/python-requests/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'Ruby',
    'variant': 'net/http',
    'syntax_mode': 'ruby',
    'main': require('../../codegens/ruby/index.js')
  },
  {
    'type': 'code_generator',
    'lang': 'swift',
    'variant': 'URLSession',
    'syntax_mode': 'swift',
    'main': require('../../codegens/swift/index.js')
  }
];
module.exports = codegenList;
