var formData = {};

var header = {
  "key": "value1",
  "key": "value2",
};

var options = {
    'method' : 'GET',
    'payload' : formData,
    'header' : header,
};

UrlFetchApp.fetch('https://postman-echo.com/get', options);
