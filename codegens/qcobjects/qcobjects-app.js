/* eslint-disable */
require('qcobjects');logger.infoEnabled=false;
        Class('MyTestService',Service,{
            name:'myservice',
            external:true,
            cached:false,
            method:"GET",
            headers:{"key":"value1",
"key":"value2"},
            url:"https://postman-echo.com/get",
            withCredentials:false,
            _new_:()=>{
                // service instantiated
            },
            done:()=>{
                // service loaded
            }
        });
    var service = serviceLoader(New(MyTestService,{
      
    })).then(
      (successfulResponse)=>{
            // This will show the service response as a plain text
            console.log(successfulResponse.service.template);
    },
    (failedResponse)=>{

    }); 