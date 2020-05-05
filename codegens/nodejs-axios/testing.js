/* eslint-disable max-len */
const sdk = require('postman-collection'),
  convert = require('.').convert,
  options = [
    {
      indentType: 'Tab',
      indentCount: 4,
      followRediredirect: false,
      trimRequestBody: true,
      requestTimeout: 0
    }
  ],
  option = {
    'method': 'POST',
    'header': [
      {
        'key': 'Content-Type',
        'value': 'text/plain',
        'disabled': false
      }
    ],
    'body': {
      'mode': 'urlencoded',
      'urlencoded': [
        {
          key: 'aaa',
          value: 'vvvvv'
        },
        {
          key: 'aaaaa',
          value: 'vvvvv'
        }
      ]
    },
    'url': {
      'raw': 'https://postman-echo.com/post',
      'protocol': 'https',
      'host': [
        'postman-echo',
        'com'
      ],
      'path': [
        'post'
      ]
    },
    'description': 'The HTTP `POST` request method is meant to transfer data to a server \n(and elicit a response). What data is returned depends on the implementation\nof the server.\n\nA `POST` request can pass parameters to the server using "Query String \nParameters", as well as the Request Body. For example, in the following request,\n\n> POST /hi/there?hand=wave\n>\n> <request-body>\n\nThe parameter "hand" has the value "wave". The request body can be in multiple\nformats. These formats are defined by the MIME type of the request. The MIME \nType can be set using the ``Content-Type`` HTTP header. The most commonly used \nMIME types are:\n\n* `multipart/form-data`\n* `application/x-www-form-urlencoded`\n* `application/json`\n\nThis endpoint echoes the HTTP headers, request parameters, the contents of\nthe request body and the complete URI requested.'
  };
var request = new sdk.Request(option);
// console.log(request.body)
convert(request, options, function (err, snippet) {
  if (err) {
    // perform desired action of logging the error
  }
  console.log(snippet);
  // perform action with the snippet
});
