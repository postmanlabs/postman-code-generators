var axios = require('axios'),
  qs = require('qs');

var config = {
    'headers': {
    }
}

axios.get('https://mockbin.org/redirect/302/1/?to=https://postman-echo.com/get', config).then((response) => {
	console.log(JSON.stringify(response.data));
}).catch((err) => {
	console.log(err);
});
