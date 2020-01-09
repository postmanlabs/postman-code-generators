/* eslint-disable */
var unirest = require('unirest');
var fs = require('fs')
var req = unirest('COPY', 'https://9c76407d-5b8d-4b22-99fb-8c47a85d9848.mock.pstmn.io')
.headers({

})
.end(function (res) { 
   if (res.err) console.log(res.err);
   console.log(JSON.stringify(res.body));
});
