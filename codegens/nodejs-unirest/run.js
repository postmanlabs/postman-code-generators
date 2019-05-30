/* eslint-disable */
var unirest = require('unirest');
var req = unirest('COPY', 'https://mockbin.org/request')
.end(function (res) { 
   if (res.err) console.log(res.err);
   console.log(JSON.stringify(res.body));
});
