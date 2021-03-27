/* eslint-disable */
import axios from 'axios' ;

let config = {
  method: 'get',
  url: 'https://postman-echo.com/get',
  headers: { 
    'key': 'value1, value2'
  }
};

let Apicall = async ()=>{ 
  try { 
    let response =await axios(config) ;
    console.log(JSON.stringify(response.data));
  }catch(err){
    console.log(err);
  };
};

Apicall();