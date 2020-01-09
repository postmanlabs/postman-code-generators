/* eslint-disable */
require('qcobjects');logger.infoEnabled=false;
        Class('MyTestService',Service,{
            name:'myservice',
            external:true,
            cached:false,
            method:"DELETE",
            headers:{"Content-Type":"text/plain"},
            url:"https://postman-echo.com/delete",
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